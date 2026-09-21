"""B5 — Ghép video bằng ffmpeg: nền zoom chậm + lớp giao diện + phụ đề + tiếng.

Chia 3 bước cho dễ gỡ lỗi:
  1. mỗi cảnh -> scene_N.mp4 (zoompan nền, overlay giao diện, fade vào)
  2. nối các cảnh -> base.mp4
  3. phủ phụ đề (chuỗi PNG theo khung hình) + trộn tiếng -> video cuối
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path

from PIL import Image

from .common import ROOT, load_config, log, rel, step

FFMPEG = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-nostdin"]


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def _zoom_expr(i: int) -> tuple[str, str, str]:
    """Xen kẽ hướng chuyển động để video không đơn điệu."""
    mode = i % 4
    if mode == 0:      # zoom vào, giữa khung
        return "min(1.0+0.00052*on,1.13)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    if mode == 1:      # zoom ra
        return "max(1.13-0.00052*on,1.0)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    if mode == 2:      # zoom vào, trôi sang phải
        return "min(1.0+0.00048*on,1.12)", "(iw-iw/zoom)*min(on/900,1)", "ih/2-(ih/zoom/2)"
    return "min(1.0+0.00048*on,1.12)", "(iw-iw/zoom)*(1-min(on/900,1))", "ih/2-(ih/zoom/2)"


def render_scene(idx: int, bg: Path, ui: Path, dur: float, cfg: dict, dest: Path,
                 clip: Path | None = None) -> None:
    """Dựng một cảnh.

    clip=None  → nền là ảnh tĩnh, tạo chuyển động bằng zoom chậm (zoompan).
    clip=path  → nền là clip do model AI sinh ra. Clip thường ngắn hơn cảnh
                 (Veo tối đa 8 giây, cảnh có thể 13 giây) nên được lặp cho đủ,
                 và không zoom thêm vì bản thân clip đã có chuyển động.
    """
    fps = cfg["video"]["fps"]
    w, h = cfg["video"]["width"], cfg["video"]["height"]

    if clip is not None:
        inputs = ["-stream_loop", "-1", "-i", str(clip), "-loop", "1", "-i", str(ui)]
        bg_chain = (
            f"[0:v]scale={w}:{h}:force_original_aspect_ratio=increase,"
            f"crop={w}:{h},fps={fps},setsar=1[bg];"
        )
    else:
        z, x, y = _zoom_expr(idx)
        inputs = ["-loop", "1", "-i", str(bg), "-loop", "1", "-i", str(ui)]
        bg_chain = (
            f"[0:v]scale={w * 2}:{h * 2}:force_original_aspect_ratio=increase,"
            f"crop={w * 2}:{h * 2},"
            f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={w}x{h}:fps={fps},setsar=1[bg];"
        )

    filt = (bg_chain
            + "[1:v]format=rgba,fade=t=in:st=0:d=0.30:alpha=1[ui];"
              "[bg][ui]overlay=0:0:format=auto[v]")

    run([*FFMPEG, *inputs,
         "-filter_complex", filt, "-map", "[v]", "-t", f"{dur:.3f}",
         "-r", str(fps), "-c:v", "libx264", "-preset", cfg["video"]["preset"],
         "-crf", str(cfg["video"]["crf"]), "-pix_fmt", "yuv420p", str(dest)])


def build_caption_sequence(visuals: dict, total: float, cfg: dict, workdir: Path) -> Path:
    """Tạo thư mục 1 ảnh/khung hình bằng symlink (không nhân bản dữ liệu)."""
    fps = cfg["video"]["fps"]
    w, h = cfg["video"]["width"], cfg["video"]["height"]
    seq = workdir / "capseq"
    if seq.exists():
        for f in seq.iterdir():
            f.unlink()
    seq.mkdir(parents=True, exist_ok=True)

    blank = workdir / "cap_blank.png"
    if not blank.exists():
        Image.new("RGBA", (w, h), (0, 0, 0, 0)).save(blank)

    cap_dir = Path(visuals["caption_dir"])
    states = visuals["captions"]
    n_frames = max(1, int(round(total * fps)))
    ptr = 0
    for f in range(n_frames):
        t = f / fps
        while ptr < len(states) and states[ptr]["end"] <= t:
            ptr += 1
        src = blank
        if ptr < len(states) and states[ptr]["start"] <= t < states[ptr]["end"]:
            src = cap_dir / f"cap_{ptr:04d}.png"
        link = seq / f"{f:05d}.png"
        os.symlink(os.path.relpath(src, seq), link)
    log(f"chuỗi phụ đề: {n_frames} khung hình")
    return seq


def mux(base: Path, seq: Path, audio: Path, cfg: dict, dest: Path) -> None:
    fps = cfg["video"]["fps"]
    music_path = cfg["music"].get("file", "")
    music = rel(music_path) if music_path else None
    has_music = bool(music and music.exists())

    inputs = ["-i", str(base), "-framerate", str(fps), "-i", str(seq / "%05d.png"), "-i", str(audio)]
    if has_music:
        inputs += ["-stream_loop", "-1", "-i", str(music)]

    vfilt = "[0:v][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]"
    if has_music:
        gain, duck = cfg["music"]["gain_db"], cfg["music"]["duck_db"]
        afilt = (
            f"[2:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"asplit=2[vo][key];"
            f"[3:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"volume={gain}dB[bed];"
            f"[bed][key]sidechaincompress=threshold=0.02:ratio=8:attack=8:release=320,"
            f"volume={duck}dB[duckbed];"
            f"[vo][duckbed]amix=inputs=2:duration=first:dropout_transition=0,"
            f"loudnorm=I=-14:TP=-1.0:LRA=11[a]"
        )
    else:
        afilt = ("[2:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
                 "loudnorm=I=-14:TP=-1.0:LRA=11[a]")

    run([*FFMPEG, *inputs, "-filter_complex", f"{vfilt};{afilt}",
         "-map", "[v]", "-map", "[a]", "-shortest",
         "-c:v", "libx264", "-preset", cfg["video"]["preset"], "-crf", str(cfg["video"]["crf"]),
         "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", "-r", str(fps),
         "-c:a", "aac", "-b:a", cfg["video"]["audio_bitrate"], "-ar", "48000", str(dest)])


def build(voice: dict, visuals: dict, cfg: dict, workdir: Path, dest: Path) -> Path:
    step("B5 · Render video")
    total = voice["total"]
    scenes = visuals["scenes"]

    # thời lượng mỗi cảnh = khoảng cách tới cảnh kế (đã gồm khoảng lặng chuyển cảnh)
    starts = [s["start"] for s in scenes] + [total]
    parts: list[Path] = []
    for i, s in enumerate(scenes):
        dur = max(0.6, starts[i + 1] - starts[i])
        out = workdir / f"scene_{i:02d}.mp4"
        clip = Path(s["clip"]) if s.get("clip") else None
        render_scene(i, workdir / s["bg"], workdir / s["ui"], dur, cfg, out, clip)
        parts.append(out)
        log(f"cảnh {i} ({s['kind']}) · {dur:.2f}s{' · clip AI' if clip else ''}")

    listfile = workdir / "scenes.txt"
    listfile.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
    base = workdir / "base.mp4"
    run([*FFMPEG, "-f", "concat", "-safe", "0", "-i", str(listfile), "-c", "copy", str(base)])

    seq = build_caption_sequence(visuals, total, cfg, workdir)
    dest.parent.mkdir(parents=True, exist_ok=True)
    mux(base, seq, Path(voice["audio"]), cfg, dest)

    size_mb = dest.stat().st_size / 1e6
    log(f"✓ {dest.name} · {size_mb:.1f} MB")
    return dest


def main() -> None:
    ap = argparse.ArgumentParser(description="Render video cuối")
    ap.add_argument("--workdir", default=str(ROOT / "output" / "_work"))
    ap.add_argument("--out", default=str(ROOT / "output" / "video.mp4"))
    args = ap.parse_args()
    cfg = load_config()
    wd = Path(args.workdir)
    voice = json.loads((wd / "voice.json").read_text(encoding="utf-8"))
    visuals = json.loads((wd / "visuals.json").read_text(encoding="utf-8"))
    build(voice, visuals, cfg, wd, Path(args.out))


if __name__ == "__main__":
    main()
