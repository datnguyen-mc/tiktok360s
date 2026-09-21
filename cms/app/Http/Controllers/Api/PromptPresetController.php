<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PromptPreset;
use App\Services\PromptBuilder;
use Illuminate\Http\Request;

class PromptPresetController extends Controller
{
    public function index()
    {
        return response()->json([
            'presets'        => PromptPreset::with('engine:id,name,type,model')
                                    ->orderByDesc('last_used_at')->orderBy('name')->get(),
            'variables'      => PromptBuilder::VARIABLES,
            'default_prompt' => PromptBuilder::DEFAULT_TEMPLATE,
        ]);
    }

    public function store(Request $request)
    {
        $preset = PromptPreset::create($this->validated($request));
        ActivityLog::write('preset.created', "Lưu prompt “{$preset->name}”", 'info', $preset);

        return response()->json($preset->load('engine'), 201);
    }

    public function update(Request $request, PromptPreset $preset)
    {
        $preset->update($this->validated($request));

        return response()->json($preset->fresh('engine'));
    }

    public function destroy(PromptPreset $preset)
    {
        $preset->delete();

        return response()->json(['deleted' => true]);
    }

    /** Xem thử prompt với một tin mẫu, trước khi tốn tiền sinh clip. */
    public function preview(Request $request)
    {
        $request->validate(['template' => ['required', 'string', 'max:2000']]);

        return response()->json([
            'preview' => PromptBuilder::render(
                $request->string('template')->toString(), PromptBuilder::SAMPLE
            ),
            'sample' => PromptBuilder::SAMPLE,
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'            => ['required', 'string', 'max:120'],
            'template'        => ['required', 'string', 'max:2000'],
            'negative_prompt' => ['nullable', 'string', 'max:2000'],
            'video_engine_id' => ['nullable', 'exists:video_engines,id'],
        ]);
    }
}
