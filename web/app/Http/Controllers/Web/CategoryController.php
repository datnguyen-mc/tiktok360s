<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Concerns\WithSidebar;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use WithSidebar;

    public function __invoke(Category $category): Response
    {
        abort_unless($category->is_active, 404);

        $articles = Article::published()->where('category_id', $category->id)
            ->latest('published_at')
            ->paginate(config('site.per_page'))
            ->withQueryString();

        return Inertia::render('Category', [
            'category'  => $category->only(['slug', 'name', 'description', 'color']),
            'articles'  => $articles,
            'sidebar'   => $this->sidebar(),
            'seo' => (new Seo(
                title: $category->seo_title ?: "Tin {$category->name}",
                description: $category->seo_description ?: $category->description
                    ?: "Tin {$category->name} mới nhất, cập nhật liên tục.",
                canonical: $category->url(),
                section: $category->name,
                // Trang 2 trở đi không cần lên chỉ mục: nội dung trùng trang 1
                noindex: $articles->currentPage() > 1,
                jsonLd: Seo::breadcrumbs([
                    ['name' => 'Trang chủ', 'url' => url('/')],
                    ['name' => $category->name, 'url' => $category->url()],
                ]),
            ))->toArray(),
        ]);
    }
}
