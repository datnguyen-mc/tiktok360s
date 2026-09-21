<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Run;
use App\Models\RunStep;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Nhận báo cáo từng bước từ dây chuyền Python.
 *
 * Bước được gửi lên ngay khi xong, nên lần chạy phải tồn tại trước — dây chuyền
 * tạo bản ghi `running` ngay từ đầu rồi mới bắt đầu làm việc.
 */
class StepController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'topic'       => ['required', 'string', 'max:40'],
            'run_date'    => ['required', 'date'],
            'sequence'    => ['required', 'integer', 'min:0', 'max:255'],
            'step'        => ['required', 'string', 'max:40'],
            'label'       => ['required', 'string', 'max:255'],
            'status'      => ['required', Rule::in(['running', 'done', 'failed'])],
            'duration_ms' => ['nullable', 'integer', 'min:0'],
            'detail'      => ['nullable', 'string'],
            'meta'        => ['nullable', 'array'],
            'started_at'  => ['nullable', 'date'],
            'finished_at' => ['nullable', 'date'],
        ]);

        // Lần chạy chưa có thì tạo khung trống — bước đầu tiên thường tới trước
        // khi có đủ dữ liệu để ghi bản ghi đầy đủ.
        $run = Run::firstOrCreate(
            ['topic' => $data['topic'], 'run_date' => $data['run_date']],
            ['status' => 'running', 'topic_name' => ucfirst($data['topic'])]
        );

        $step = RunStep::updateOrCreate(
            ['run_id' => $run->id, 'step' => $data['step']],
            collect($data)->except(['topic', 'run_date'])->all()
        );

        return response()->json(['id' => $step->id, 'run_id' => $run->id], 201);
    }
}
