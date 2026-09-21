<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoEngine;
use App\Services\VideoEngineRunner;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class VideoEngineController extends Controller
{
    public function __construct(private VideoEngineRunner $runner) {}

    public function index()
    {
        return response()->json([
            'engines'   => VideoEngine::withCount('runs')
                              ->orderByDesc('is_default')->orderBy('name')->get()
                              ->map(fn ($e) => array_merge($e->toArray(), [
                                  // Ước tính theo độ dài video mục tiêu hiện tại
                                  'estimate' => $e->estimateCost(105),
                              ])),
            'providers' => config('aiproviders'),
        ]);
    }

    /** Ước tính chi phí khi người dùng còn đang chỉnh form, chưa lưu. */
    public function estimate(Request $request)
    {
        $data = $request->validate([
            'type'            => ['required', 'string'],
            'model'           => ['nullable', 'string'],
            'resolution'      => ['nullable', 'string'],
            'clip_seconds'    => ['required', 'integer', 'min:1', 'max:60'],
            'cost_per_second' => ['nullable', 'numeric'],
            'seconds'         => ['required', 'numeric', 'min:1', 'max:1200'],
        ]);

        $engine = new VideoEngine($data);

        return response()->json(['estimate' => $engine->estimateCost((float) $data['seconds'])]);
    }

    public function store(Request $request)
    {
        return response()->json(VideoEngine::create($this->validated($request)), 201);
    }

    public function update(Request $request, VideoEngine $engine)
    {
        $data = $this->validated($request);

        // Ô khoá hiện dấu chấm nghĩa là người dùng không đổi — giữ khoá cũ.
        foreach (['api_key', 'api_secret'] as $secret) {
            if (($data[$secret] ?? null) === '••••••••') {
                unset($data[$secret]);
            }
        }

        $engine->update($data);

        return response()->json($engine->fresh());
    }

    public function destroy(VideoEngine $engine)
    {
        $engine->delete();

        return response()->json(['deleted' => true]);
    }

    /** Bấm "Tạo video ngay" từ giao diện. */
    public function trigger(Request $request, VideoEngine $engine)
    {
        $options = $request->validate([
            'date'  => ['nullable', 'date_format:Y-m-d'],
            'items' => ['nullable', 'integer', 'min:1', 'max:30'],
            'voice' => ['nullable', 'string', 'max:60'],
        ]);

        try {
            return response()->json($this->runner->trigger($engine, array_filter($options)));
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'             => ['required', 'string', 'max:120'],
            'type'             => ['required', Rule::in(['local', 'http', 'veo', 'kling'])],
            'model'            => ['nullable', 'string', 'max:80'],
            'api_secret'       => ['nullable', 'string', 'max:500'],
            'resolution'       => ['nullable', 'string', 'max:10'],
            'aspect_ratio'     => ['nullable', 'string', 'max:10'],
            'clip_seconds'     => ['nullable', 'integer', 'min:1', 'max:60'],
            'mode'             => ['nullable', 'string', 'max:10'],
            'negative_prompt'  => ['nullable', 'string', 'max:2000'],
            'cost_per_second'  => ['nullable', 'numeric', 'min:0', 'max:100'],
            'command'          => ['nullable', 'string', 'max:1000'],
            'working_dir'      => ['nullable', 'string', 'max:500'],
            'endpoint'         => ['nullable', 'url', 'max:1000'],
            'api_key'          => ['nullable', 'string', 'max:500'],
            'auth_header'      => ['nullable', 'string', 'max:80'],
            'auth_prefix'      => ['nullable', 'string', 'max:40'],
            'payload_template' => ['nullable', 'array'],
            'is_default'       => ['boolean'],
            'is_active'        => ['boolean'],
        ]);
    }
}
