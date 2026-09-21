<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PromptPreset;
use App\Models\VideoEngine;
use App\Services\VideoEngineRunner;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Bấm "Tạo video" ở trang Video.
 *
 * Prompt đi kèm yêu cầu này là prompt **rời**, không đụng tới prompt cố định của
 * kênh. Người dùng chọn lưu thì nó thành preset dùng lại được.
 */
class CreateVideoController extends Controller
{
    public function __construct(private VideoEngineRunner $runner) {}

    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'video_engine_id' => ['nullable', 'exists:video_engines,id'],
            'prompt_preset_id'=> ['nullable', 'exists:prompt_presets,id'],
            'prompt'          => ['nullable', 'string', 'max:2000'],
            'negative_prompt' => ['nullable', 'string', 'max:2000'],
            'topic'           => ['nullable', 'string', 'max:40'],
            'date'            => ['nullable', 'date_format:Y-m-d'],
            'items'           => ['nullable', 'integer', 'min:1', 'max:30'],
            'voice'           => ['nullable', 'string', 'max:60'],

            // Lưu prompt vừa gõ thành preset để lần sau gọi lại
            'save_as'         => ['nullable', 'string', 'max:120'],
        ]);

        // validate() chỉ trả về những khoá CÓ trong request, nên phải dùng ?? ở mọi chỗ
        // — bấm nút mà không chọn engine thì khoá này không tồn tại.
        $engine = ! empty($data['video_engine_id'])
            ? VideoEngine::findOrFail($data['video_engine_id'])
            : VideoEngine::where('is_default', true)->where('is_active', true)->first()
              ?? VideoEngine::where('is_active', true)->first();

        if (! $engine) {
            throw ValidationException::withMessages([
                'video_engine_id' => 'Chưa có engine nào đang bật. Vào mục Engine tạo video để thêm.',
            ]);
        }

        // Prompt chỉ có tác dụng với engine sinh cảnh bằng AI.
        $preset = null;
        $prompt = $data['prompt'] ?? null;
        $negative = $data['negative_prompt'] ?? null;

        if ($engine->is_ai) {
            // Chọn prompt đã lưu mà không gõ gì thêm thì lấy nội dung của nó.
            if (blank($prompt) && ! empty($data['prompt_preset_id'])) {
                $preset = PromptPreset::find($data['prompt_preset_id']);
                $prompt = $preset?->template;
                $negative ??= $preset?->negative_prompt;
            }

            // Bấm "lưu prompt này" thì ghi vào thư viện để lần sau gọi lại.
            if (filled($data['save_as'] ?? null)) {
                if (blank($prompt)) {
                    throw ValidationException::withMessages([
                        'prompt' => 'Muốn lưu thì phải có nội dung prompt.',
                    ]);
                }
                $preset = PromptPreset::create([
                    'name'            => $data['save_as'],
                    'template'        => $prompt,
                    'negative_prompt' => $negative,
                    'video_engine_id' => $engine->id,
                ]);
                ActivityLog::write('preset.created', "Lưu prompt “{$preset->name}”", 'info', $preset);
            }
        }

        // Prompt đi thẳng xuống dây chuyền, không qua bảng trung gian — prompt
        // dùng một lần thì không để lại rác trong thư viện.
        $options = array_filter([
            'topic'           => $data['topic'] ?? null,
            'date'            => $data['date']  ?? null,
            'items'           => $data['items'] ?? null,
            'voice'           => $data['voice'] ?? null,
            'prompt'          => $engine->is_ai ? $prompt : null,
            'negative_prompt' => $engine->is_ai ? $negative : null,
        ], fn ($v) => $v !== null && $v !== '');

        try {
            $result = $this->runner->trigger($engine, $options);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $preset?->markUsed();

        return response()->json([
            ...$result,
            'engine' => $engine->only(['id', 'name', 'type', 'model']),
            'preset' => $preset?->only(['id', 'name']),
            'estimate' => $engine->estimateCost(105),
        ]);
    }
}
