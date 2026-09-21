<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ArticleAdminController extends Controller
{
    public function index(Request $request)
    {
        $articles = Article::with('category:id,name,slug,color')
            ->when($request->string('q')->toString(), fn ($q, $t) => $q->where('title', 'like', "%{$t}%"))
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->when($request->integer('category'), fn ($q, $c) => $q->where('category_id', $c))
            ->latest('published_at')
            ->paginate(25)->withQueryString();

        return Inertia::render('Admin/Articles', [
            'articles'   => $articles,
            'categories' => Category::orderBy('sort')->get(['id', 'name', 'slug', 'color']),
            'filters'    => $request->only(['q', 'status', 'category']),
            'stats'      => [
                'total'     => Article::count(),
                'published' => Article::where('status', 'published')->count(),
                'draft'     => Article::where('status', 'draft')->count(),
                'today'     => Article::whereDate('published_at', today())->count(),
            ],
        ]);
    }

    public function edit(Article $article)
    {
        return Inertia::render('Admin/ArticleEdit', [
            'article'    => $article->load('category:id,name'),
            'categories' => Category::orderBy('sort')->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ArticleEdit', [
            'article'    => null,
            'categories' => Category::orderBy('sort')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = Article::makeSlug($data['title']);
        $data['fingerprint'] = Article::fingerprint($data['title']);
        $data['is_original'] = true;
        $data['published_at'] ??= now();

        $article = Article::create($data);
        $this->flushCaches();

        return redirect("/admin/articles/{$article->id}")->with('success', 'Đã tạo bài viết');
    }

    public function update(Request $request, Article $article)
    {
        $article->update($this->validated($request));
        $this->flushCaches();

        return back()->with('success', 'Đã lưu bài viết');
    }

    public function destroy(Article $article)
    {
        $article->delete();
        $this->flushCaches();

        return redirect('/admin/articles')->with('success', 'Đã xoá bài viết');
    }

    /** Đổi nhanh trạng thái / nổi bật ngay trên danh sách. */
    public function toggle(Request $request, Article $article)
    {
        $data = $request->validate([
            'field' => ['required', Rule::in(['status', 'is_featured'])],
            'value' => ['required'],
        ]);

        $article->update([$data['field'] => $data['value']]);
        $this->flushCaches();

        return back();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title'           => ['required', 'string', 'max:500'],
            'category_id'     => ['nullable', 'exists:categories,id'],
            'excerpt'         => ['nullable', 'string', 'max:2000'],
            'content'         => ['nullable', 'string'],
            'image_url'       => ['nullable', 'string', 'max:1000'],
            'source'          => ['nullable', 'string', 'max:80'],
            'source_url'      => ['nullable', 'string', 'max:1000'],
            'status'          => ['required', Rule::in(['published', 'draft', 'hidden'])],
            'is_featured'     => ['boolean'],
            'seo_title'       => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'published_at'    => ['nullable', 'date'],
        ]);
    }

    private function flushCaches(): void
    {
        foreach (['home.v1', 'feed.rss', 'sitemap.index', 'sitemap.cats'] as $key) {
            Cache::forget($key);
        }
    }
}
