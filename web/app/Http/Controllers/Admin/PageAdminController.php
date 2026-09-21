<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PageAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Pages', [
            'pages' => Page::orderBy('sort')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?: Page::makeSlug($data['title']);

        Page::create($data);

        return back()->with('success', 'Đã tạo trang');
    }

    public function update(Request $request, Page $page)
    {
        $data = $this->validated($request, $page->id);
        $data['slug'] = $data['slug'] ?: Page::makeSlug($data['title'], $page->id);

        $page->update($data);

        return back()->with('success', 'Đã lưu trang');
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return back()->with('success', 'Đã xoá trang');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title'           => ['required', 'string', 'max:200'],
            'slug'            => ['nullable', 'string', 'max:120', 'alpha_dash',
                                  Rule::unique('pages', 'slug')->ignore($ignoreId)],
            'excerpt'         => ['nullable', 'string', 'max:300'],
            'content'         => ['nullable', 'string'],
            'is_published'    => ['boolean'],
            'in_footer'       => ['boolean'],
            'sort'            => ['integer', 'min:0', 'max:999'],
            'seo_title'       => ['nullable', 'string', 'max:200'],
            'seo_description' => ['nullable', 'string', 'max:300'],
        ], [], ['title' => 'tiêu đề', 'slug' => 'đường dẫn']);
    }
}
