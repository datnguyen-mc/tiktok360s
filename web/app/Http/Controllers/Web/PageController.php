<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __invoke(Page $page): Response
    {
        abort_unless($page->is_published, 404);

        return Inertia::render('Page', [
            'page' => $page,
            'seo'  => (new Seo(
                title: $page->seo_title ?: $page->title,
                description: $page->seo_description ?: $page->excerpt,
                canonical: $page->url(),
                jsonLd: [Seo::breadcrumbs([
                    ['name' => 'Trang chủ', 'url' => url('/')],
                    ['name' => $page->title, 'url' => $page->url()],
                ])],
            ))->toArray(),
        ]);
    }
}
