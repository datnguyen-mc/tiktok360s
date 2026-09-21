<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TiktokAccount;
use Illuminate\Http\Request;
use App\Services\PromptBuilder;
use Illuminate\Validation\Rule;

/** Quản lý kênh TikTok: thiết lập đăng bài riêng cho từng tài khoản đã kết nối. */
class ChannelController extends Controller
{
    public function index()
    {
        return response()->json([
            'channels'  => TiktokAccount::withCount([
                                'publishJobs as published_count' => fn ($q) => $q->where('status', 'published'),
                            ])->with('engine:id,name,type,model')
                              ->orderByDesc('is_active')->latest('id')->get(),
            'variables' => PromptBuilder::VARIABLES,
            'default_prompt' => PromptBuilder::DEFAULT_TEMPLATE,
        ]);
    }

    /** Xem thử prompt sẽ trông thế nào với một tin mẫu. */
    public function previewPrompt(Request $request)
    {
        $request->validate(['template' => ['required', 'string', 'max:2000']]);

        return response()->json([
            'preview' => PromptBuilder::render($request->string('template')->toString(), PromptBuilder::SAMPLE),
        ]);
    }

    public function update(Request $request, TiktokAccount $account)
    {
        $account->update($request->validate([
            'nickname'        => ['nullable', 'string', 'max:120'],
            'is_active'       => ['boolean'],
            'auto_publish'    => ['boolean'],
            'publish_time'    => ['nullable', 'date_format:H:i'],
            'default_mode'    => ['required', Rule::in(['inbox', 'direct_post'])],
            'default_privacy' => ['required', 'string', 'max:40'],
            'caption_suffix'  => ['nullable', 'string', 'max:500'],
            'notes'           => ['nullable', 'string', 'max:2000'],
            'video_engine_id' => ['nullable', 'exists:video_engines,id'],
            'prompt_template' => ['nullable', 'string', 'max:2000'],
            'negative_prompt' => ['nullable', 'string', 'max:2000'],
        ]));

        return response()->json($account->fresh());
    }
}
