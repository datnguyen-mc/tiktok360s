<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Danh sách model đang có của từng nhà cung cấp, hỏi thẳng API của họ.
 *
 * Viết cứng danh sách trong mã thì vài tháng là lạc hậu — hai bên ra model mới
 * liên tục và bỏ model cũ cũng liên tục. Hỏi API thì danh sách luôn đúng với
 * đúng cái khoá đang dùng (tài khoản khác nhau được cấp quyền khác nhau).
 *
 * Chưa có khoá thì trả về một danh sách tối thiểu để giao diện còn có cái hiện.
 */
class AiModelController extends Controller
{
    /**
     * Chỉ hiện vài dòng model đang dùng được, không đổ cả danh sách API.
     *
     * Hỏi API thì Gemini trả về gần hai chục bản, lẫn cả bản xem trước và bản
     * đời cũ — chọn giữa ngần ấy thứ vừa rối vừa dễ chọn nhầm bản yếu. Lọc theo
     * tiền tố, nên model mới cùng dòng ra sau vẫn tự xuất hiện.
     */
    private const CHO_PHEP = [
        'gemini' => ['gemini-flash-latest', 'gemini-3.8', 'gemini-3.5'],
        'openai' => ['gpt-6', 'gpt-5.6', 'gpt-4o'],
    ];

    /** Dùng khi chưa khai khoá hoặc gọi API hỏng — vẫn phải có cái để chọn. */
    private const DU_PHONG = [
        'gemini' => ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash'],
        'openai' => ['gpt-6.1-sol', 'gpt-4o-mini'],
    ];

    /** Bỏ những model không dùng để viết chữ: đọc, nhúng, ảnh, nhạc, robot… */
    private const LOAI_TRU = ['tts', 'embedding', 'image', 'vision', 'aqa', 'audio',
                              'transcribe', 'robotics', 'lyria', 'veo', 'imagen',
                              'computer-use', 'realtime', 'moderation', 'dall-e',
                              'whisper', 'search', 'codex', 'nano-banana',
                              'antigravity', 'deep-research', 'omni', 'instruct'];

    public function __invoke(string $provider)
    {
        if (! isset(self::DU_PHONG[$provider])) {
            return response()->json(['message' => 'Nhà cung cấp không hợp lệ'], 422);
        }

        // Danh sách đổi rất chậm, mà mỗi lần mở hộp thoại lại gọi một lượt thì
        // vừa chậm vừa tốn hạn mức. Giữ một giờ.
        $ra = Cache::remember("ai-models.$provider", 3600, function () use ($provider) {
            try {
                $ds = $provider === 'gemini' ? $this->gemini() : $this->openai();
            } catch (\Throwable $e) {
                Log::warning("Không lấy được danh sách model $provider", ['loi' => $e->getMessage()]);
                $ds = [];
            }

            return $ds
                ? ['models' => $ds, 'source' => 'api']
                : ['models' => self::DU_PHONG[$provider], 'source' => 'dự phòng'];
        });

        return response()->json($ra);
    }

    private function gemini(): array
    {
        $key = Setting::get('gemini.api_key');
        if (! $key) {
            return [];
        }

        $r = Http::timeout(20)->get('https://generativelanguage.googleapis.com/v1beta/models', [
            'key' => $key, 'pageSize' => 200,
        ]);
        if (! $r->successful()) {
            return [];
        }

        $ds = [];
        foreach ($r->json('models') ?? [] as $m) {
            // Chỉ lấy model sinh chữ; nhiều model trong danh sách chỉ hỗ trợ
            // nhúng vector hoặc đếm token.
            if (! in_array('generateContent', $m['supportedGenerationMethods'] ?? [], true)) {
                continue;
            }
            $ten = str_replace('models/', '', $m['name'] ?? '');
            if ($ten && ! $this->biLoai($ten) && $this->duocPhep($ten, 'gemini')) {
                $ds[] = $ten;
            }
        }

        return $this->xep($ds);
    }

    private function openai(): array
    {
        $key = Setting::get('openai.api_key');
        if (! $key) {
            return [];
        }

        $r = Http::withToken($key)->timeout(20)->get('https://api.openai.com/v1/models');
        if (! $r->successful()) {
            return [];
        }

        $ds = [];
        foreach ($r->json('data') ?? [] as $m) {
            $ten = $m['id'] ?? '';
            // OpenAI trả về cả model ảnh, giọng nói và nhúng trong cùng danh sách;
            // lọc theo tiền tố họ model sinh chữ.
            if ($ten && ! $this->biLoai($ten) && $this->duocPhep($ten, 'openai')) {
                $ds[] = $ten;
            }
        }

        return $this->xep($ds);
    }

    private function duocPhep(string $ten, string $provider): bool
    {
        foreach (self::CHO_PHEP[$provider] as $tien_to) {
            if (str_starts_with($ten, $tien_to)) {
                return true;
            }
        }

        return false;
    }

    private function biLoai(string $ten): bool
    {
        // Bản ghim ngày (gpt-4o-2024-08-06) là ảnh chụp của chính bản không ghim
        // ngày ngay trên nó. Hiện cả hai chỉ làm danh sách dài gấp đôi.
        if (preg_match('/-20\d{2}-\d{2}-\d{2}$/', $ten)) {
            return true;
        }

        foreach (self::LOAI_TRU as $t) {
            if (str_contains($ten, $t)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Xếp theo thứ tự dễ chọn: dòng chính trước, bí danh "-latest" lên đầu dòng
     * của nó, rồi tới số hiệu mới nhất.
     *
     * Gemma là model mở, cùng nhà nhưng khác dòng và yếu hơn hẳn ở tiếng Việt,
     * nên đẩy xuống cuối thay vì để lẫn giữa các bản Gemini.
     */
    private function xep(array $ds): array
    {
        $hang = fn (string $t) => match (true) {
            str_starts_with($t, 'gemini'), str_starts_with($t, 'gpt'),
            preg_match('/^o[1-9]/', $t) === 1 => 0,
            default => 1,
        };

        $ds = array_values(array_unique($ds));
        usort($ds, function ($a, $b) use ($hang) {
            if ($hang($a) !== $hang($b)) {
                return $hang($a) <=> $hang($b);
            }
            $la = (int) str_contains($a, 'latest');
            $lb = (int) str_contains($b, 'latest');

            return $la !== $lb ? $lb <=> $la : strnatcmp($b, $a);
        });

        return $ds;
    }
}
