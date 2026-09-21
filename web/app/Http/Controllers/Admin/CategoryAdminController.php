<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Categories', [
            'categories' => Category::withCount('articles')->orderBy('sort')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['name']);
        Category::create($data);
        Cache::forget('home.v1');

        return back()->with('success', 'Đã thêm chuyên mục');
    }

    public function update(Request $request, Category $category)
    {
        $category->update($this->validated($request, $category));
        Cache::forget('home.v1');

        return back()->with('success', 'Đã lưu chuyên mục');
    }

    public function destroy(Category $category)
    {
        if ($category->articles()->exists()) {
            return back()->with('error',
                'Chuyên mục còn bài viết. Chuyển bài sang chuyên mục khác trước khi xoá.');
        }

        $category->delete();
        Cache::forget('home.v1');

        return back()->with('success', 'Đã xoá chuyên mục');
    }

    private function validated(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'name'            => ['required', 'string', 'max:80'],
            'topic'           => ['nullable', 'string', 'max:40',
                                  Rule::unique('categories', 'topic')->ignore($category?->id)],
            'description'     => ['nullable', 'string', 'max:255'],
            'color'           => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'sort'            => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active'       => ['boolean'],
            'in_menu'         => ['boolean'],
            'seo_title'       => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ]);
    }
}
