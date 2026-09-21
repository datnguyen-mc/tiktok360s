<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TiktokAccount;
use App\Models\VideoEngine;
use App\Services\PromptBuilder;
use Illuminate\Http\Request;

/**
 * Dây chuyền Python đọc cấu hình sinh cảnh từ đây.
 *
 * Endpoint này **trả về khoá API** của engine, nên nó dùng chung cơ chế xác thực
 * với đường nạp dữ liệu (`X-Ingest-Token`) và chỉ nên mở trong mạng nội bộ.
 * Đưa CMS ra Internet thì phải bọc thêm: chặn theo IP, hoặc đổi sang khoá riêng
 * cho endpoint này.
 */
class PipelineConfigController extends Controller
{
    public function __invoke(Request $request)
    {
        $channel = $request->filled('channel')
            ? TiktokAccount::find($request->integer('channel'))
            : TiktokAccount::where('is_active', true)->whereNotNull('prompt_template')->first();

        // Thứ tự ưu tiên: engine chỉ đích danh → engine của kênh → engine mặc định
        $engine = ($request->filled('engine') ? VideoEngine::find($request->integer('engine')) : null)
            ?? $channel?->engine
            ?? VideoEngine::where('is_default', true)->where('is_active', true)->first()
            ?? VideoEngine::where('is_active', true)->first();

        if (! $engine || ! $engine->is_ai) {
            // Không có engine AI: dây chuyền dùng ảnh báo như bình thường.
            return response()->json(['mode' => 'photo']);
        }

        return response()->json([
            'mode'    => 'ai_clip',
            'channel' => $channel ? [
                'id'              => $channel->id,
                'name'            => $channel->nickname ?: $channel->display_name,
                'prompt_template' => $channel->prompt_template ?: PromptBuilder::DEFAULT_TEMPLATE,
                'negative_prompt' => $channel->negative_prompt,
            ] : [
                'id'              => null,
                'name'            => null,
                'prompt_template' => PromptBuilder::DEFAULT_TEMPLATE,
                'negative_prompt' => null,
            ],
            'engine' => [
                'id'              => $engine->id,
                'name'            => $engine->name,
                'provider'        => $engine->type,
                'model'           => $engine->model,
                'api_key'         => $engine->api_key,
                'api_secret'      => $engine->api_secret,
                'resolution'      => $engine->resolution,
                'aspect_ratio'    => $engine->aspect_ratio,
                'clip_seconds'    => (int) $engine->clip_seconds,
                'mode'            => $engine->mode,
                'negative_prompt' => $engine->negative_prompt,
                'cost_per_second' => $engine->pricePerSecond(),
            ],
        ]);
    }
}
