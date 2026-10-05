<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Run;
use App\Models\SeriesEpisode;
use App\Models\SeriesItem;
use App\Models\Setting;
use App\Models\VideoEngine;
use Illuminate\Http\Request;

/**
 * Trí nhớ của kênh phim nhiều tập.
 *
 * Dây chuyền hỏi "tập gần nhất là tập nào" trước khi viết tập mới, rồi gửi tập
 * vừa viết về đây. Không có bước này thì mỗi ngày AI lại viết tập một.
 */
class SeriesController extends Controller
{
    /** Tập gần nhất, để AI biết viết tiếp từ đâu. */
    public function last(string $topic)
    {
        $ep = SeriesEpisode::latestFor($topic);

        return response()->json([
            'episode' => $ep ? [
                'so_tap'     => $ep->so_tap,
                'tieu_de'    => $ep->tieu_de,
                'tom_tat'    => $ep->tom_tat,
                'cau_chot'   => $ep->cau_chot,
                'trang_thai' => $ep->trang_thai,
                'ngay'       => $ep->ngay?->toDateString(),
                // Series danh mục cần biết đã đi hết bao nhiêu mục dàn bài
                'da_dung'    => $ep->da_dung,
                'muc'        => $ep->muc,
            ] : null,
        ]);
    }

    /**
     * Các mục kế tiếp chưa lên video.
     *
     * Dây chuyền hỏi đây thay vì tự đọc file topics/: lộ trình nằm trong cơ sở
     * dữ liệu nên sửa được trong CMS, và trạng thái "đã lên video chưa" là thứ
     * file JSON không giữ được.
     */
    public function next(Request $request, string $topic)
    {
        $n = max(1, min(10, (int) $request->integer('n', 1)));
        $items = SeriesItem::tiepTheo($topic, $n);

        return response()->json([
            'items' => $items->map->toPipeline()->all(),
            'da_dung' => SeriesItem::where('topic', $topic)->whereNotNull('da_dung_luc')->count(),
            'tong'    => SeriesItem::where('topic', $topic)->where('bat', true)->count(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'topic'      => ['required', 'string', 'max:40'],
            'so_tap'     => ['required', 'integer', 'min:1', 'max:65000'],
            'ngay'       => ['nullable', 'date'],
            'tieu_de'    => ['required', 'string', 'max:200'],
            'tom_tat'    => ['nullable', 'string'],
            'cau_chot'   => ['nullable', 'string'],
            'trang_thai' => ['nullable', 'string'],
            'canh'       => ['nullable', 'array'],
            'da_dung'    => ['nullable', 'integer', 'min:0'],
            'muc'        => ['nullable', 'array'],
            'model'      => ['nullable', 'string', 'max:60'],
        ]);

        // updateOrCreate theo (chủ đề, số tập): chạy lại cùng một tập thì ghi đè,
        // không sinh ra hai tập cùng số làm lệch cả mạch chuyện về sau.
        $ep = SeriesEpisode::updateOrCreate(
            ['topic' => $data['topic'], 'so_tap' => $data['so_tap']],
            [...$data, 'run_id' => $this->runFor($data)]
        );

        // Đánh dấu các mục đã lên video. Làm sau khi lưu tập để nếu việc lưu
        // hỏng thì mục vẫn còn nguyên, lần sau viết lại chứ không bị bỏ qua.
        if ($muc = $request->input('muc')) {
            SeriesItem::where('topic', $data['topic'])
                ->whereIn('ten', (array) $muc)
                ->whereNull('da_dung_luc')
                ->update(['da_dung_luc' => now(), 'episode_id' => $ep->id]);
        }

        ActivityLog::write(
            'series.episode_written',
            "Viết tập {$ep->so_tap} “{$ep->tieu_de}” ({$ep->topic})",
            'info', $ep,
            ['canh' => count($ep->canh ?? []), 'model' => $ep->model]
        );

        return response()->json(['id' => $ep->id, 'so_tap' => $ep->so_tap], 201);
    }

    /** Tiến độ của một kênh series, cho giao diện hiển thị. */
    public function progress(string $topic)
    {
        $tong = SeriesItem::where('topic', $topic)->where('bat', true)->count();
        $xong = SeriesItem::where('topic', $topic)->whereNotNull('da_dung_luc')->count();

        return response()->json([
            'topic'    => $topic,
            'tong'     => $tong,
            'da_dung'  => $xong,
            'con_lai'  => max(0, $tong - $xong),
            'so_tap'   => SeriesEpisode::where('topic', $topic)->max('so_tap') ?? 0,
            'tiep_theo' => SeriesItem::tiepTheo($topic, 3)->pluck('ten'),
            'gan_nhat' => SeriesEpisode::latestFor($topic)?->only(['so_tap', 'tieu_de', 'ngay']),
        ]);
    }

    /**
     * Đặt lại series về tập 1.
     *
     * Gỡ mốc "đã lên video" của mọi mục trong lộ trình. Các tập đã sinh thì mặc
     * định GIỮ LẠI — chúng là nội dung đã làm ra, xoá nhầm là mất. Muốn xoá
     * hẳn thì gửi kèm `xoa_tap=true`.
     *
     * KHÔNG đụng tới video đã dựng và đã đăng: đặt lại lộ trình chỉ nói "bắt
     * đầu viết lại từ mục đầu tiên", không phải "xoá những gì đã làm".
     */
    public function reset(Request $request, string $topic)
    {
        $data = $request->validate([
            'xoa_tap'   => ['boolean'],
            'xoa_video' => ['boolean'],
        ]);

        $moc = SeriesItem::where('topic', $topic)
            ->update(['da_dung_luc' => null, 'episode_id' => null]);

        $tap = 0;
        if ($data['xoa_tap'] ?? false) {
            $tap = SeriesEpisode::where('topic', $topic)->delete();
        }

        $video = 0;
        if ($data['xoa_video'] ?? false) {
            $video = Run::where('topic', $topic)->delete();
        }

        ActivityLog::write(
            'series.reset',
            sprintf('Đặt lại series “%s” về đầu · %d mục%s%s', $topic, $moc,
                $tap ? ", xoá {$tap} tập" : '', $video ? ", xoá {$video} video" : ''),
            'warning', null,
            ['topic' => $topic, 'muc' => $moc, 'tap' => $tap, 'video' => $video]
        );

        return response()->json([
            'message' => sprintf('Đã đặt lại %d mục về chưa dùng%s.', $moc,
                $tap ? " và xoá {$tap} tập" : ''),
            ...$this->progress($topic)->getData(true),
        ]);
    }

    /** Khoá Gemini: ưu tiên khoá khai riêng, không có thì mượn của engine Veo. */
    public function key()
    {
        $key = Setting::get('gemini.api_key');

        if (! $key) {
            // Cùng một khoá Google AI Studio dùng được cho cả Gemini lẫn Veo,
            // nên không bắt người dùng khai hai lần. Cột là `type`, không phải
            // `provider` — bảng này có từ trước khi có khái niệm nhà cung cấp.
            $key = VideoEngine::where('type', 'veo')->where('is_active', true)
                ->whereNotNull('api_key')->value('api_key');
        }

        // Trả cả hai khoá trong một lượt: dây chuyền chọn nhà cung cấp bằng
        // cấu hình kênh, hỏi riêng từng khoá thì mỗi lần đổi lại thêm một vòng gọi.
        return response()->json([
            'key'          => $key ?: null,
            'openai_key'   => Setting::get('openai.api_key') ?: null,
            'gemini_model' => Setting::get('gemini.model') ?: null,
            'openai_model' => Setting::get('openai.model') ?: null,
        ]);
    }

    private function runFor(array $data): ?int
    {
        if (empty($data['ngay'])) {
            return null;
        }

        return Run::where('topic', $data['topic'])
            ->whereDate('run_date', $data['ngay'])->value('id');
    }
}
