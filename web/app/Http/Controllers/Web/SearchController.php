<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Concerns\WithSidebar;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Support\Seo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    use WithSidebar;

    public function __invoke(Request $request): Response
    {
        $term = trim((string) $request->query('q', ''));

        $articles = $term === ''
            ? Article::published()->whereRaw('1 = 0')->paginate(config('site.per_page'))
            : Article::published()->with('category:id,slug,name,color')
                ->search($term)
                ->latest('published_at')
                ->paginate(config('site.per_page'))->withQueryString();

        return Inertia::render('Search', [
            'term'     => $term,
            'articles' => $articles,
            'sidebar'  => $this->sidebar(),
            'seo' => (new Seo(
                title: $term ? "Tìm kiếm: {$term}" : 'Tìm kiếm',
                description: "Kết quả tìm kiếm cho “{$term}”.",
                // Trang kết quả tìm kiếm không nên vào chỉ mục Google
                noindex: true,
            ))->toArray(),
        ]);
    }
}
