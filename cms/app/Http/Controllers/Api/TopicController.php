<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Run;
use App\Services\TopicRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class TopicController extends Controller
{
    public function __construct(private TopicRepository $repo) {}

    public function index()
    {
        $topics = $this->repo->all();

        // Gắn thêm số liệu thực tế để biết chủ đề nào đang chạy đều
        $stats = Run::select('topic',
                    DB::raw('COUNT(*) as total'),
                    DB::raw('MAX(run_date) as last_date'),
                    DB::raw('SUM(status = "success") as ok'))
                ->groupBy('topic')->get()->keyBy('topic');

        foreach ($topics as &$t) {
            $s = $stats->get($t['slug']);
            $t['runs_total'] = (int) ($s->total ?? 0);
            $t['runs_ok']    = (int) ($s->ok ?? 0);
            $t['last_date']  = $s->last_date ?? null;
        }

        return response()->json([
            'topics' => $topics,
            'dir'    => $this->repo->dir(),
        ]);
    }

    public function show(string $slug)
    {
        try {
            return response()->json([
                'slug' => $slug,
                'data' => $this->repo->read($slug),
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, string $slug)
    {
        // validate() CHỈ trả về những khoá có trong luật. Dùng nó làm dữ liệu ghi
        // sẽ xoá mất styles, nhom_tu_khoa… nên chỉ dùng để kiểm tra, còn dữ liệu
        // ghi thì lấy nguyên từ request rồi gộp lên bản hiện có.
        $request->validate([
            'data'                  => ['required', 'array'],
            'data.name'             => ['required', 'string', 'max:80'],
            'data.description'      => ['nullable', 'string', 'max:255'],
            'data.brand'            => ['required', 'array'],
            'data.brand.name'       => ['required', 'string', 'max:60'],
            'data.brand.handle'     => ['required', 'string', 'max:60'],
            'data.brand.accent'     => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'data.sources'          => ['required', 'array', 'min:1'],
            'data.sources.*.name'   => ['required', 'string', 'max:40'],
            'data.sources.*.url'    => ['required', 'url', 'max:500'],
            'data.sources.*.weight' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'data.voice'            => ['nullable', 'array'],
            'data.voice.id'         => ['required_with:data.voice', 'string', 'max:60'],
            // edge-tts nhận dạng "+25%" / "-15Hz"; sai định dạng là nó trả về rỗng
            'data.voice.rate'       => ['nullable', 'regex:/^[+-]\d{1,3}%$/'],
            'data.voice.pitch'      => ['nullable', 'regex:/^[+-]\d{1,3}Hz$/'],
            'data.voice.volume'     => ['nullable', 'regex:/^[+-]\d{1,3}%$/'],
            'data.ranking'          => ['required', 'array'],
            'data.hashtags'         => ['required', 'array'],
        ]);

        try {
            $saved = $this->repo->merge($slug, $request->input('data', []));
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        ActivityLog::write('topic.updated', "Cập nhật chủ đề “{$saved['name']}”", 'info');

        return response()->json(['slug' => $slug, 'data' => $saved]);
    }

    /** Tạo chủ đề mới bằng cách chép từ một chủ đề sẵn có. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:40', 'regex:/^[a-z0-9_-]+$/'],
            'name' => ['required', 'string', 'max:80'],
            'from' => ['required', 'string', 'max:40'],
        ]);

        if (is_file($this->repo->path($data['slug']))) {
            return response()->json(['message' => "Chủ đề “{$data['slug']}” đã tồn tại."], 422);
        }

        try {
            $created = $this->repo->duplicate($data['from'], $data['slug'], $data['name']);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        ActivityLog::write('topic.created',
            "Tạo chủ đề “{$data['name']}” từ “{$data['from']}”", 'info');

        return response()->json(['slug' => $data['slug'], 'data' => $created], 201);
    }

    public function destroy(string $slug)
    {
        $used = Run::where('topic', $slug)->count();
        if ($used > 0) {
            return response()->json([
                'message' => "Chủ đề này đã có {$used} video. Xoá file cấu hình sẽ không xoá video, "
                            ."nhưng lần chạy sau sẽ lỗi. Vẫn muốn xoá thì xoá thủ công trong topics/.",
            ], 422);
        }

        $this->repo->delete($slug);
        ActivityLog::write('topic.deleted', "Xoá chủ đề “{$slug}”", 'warning');

        return response()->json(['deleted' => true]);
    }
}
