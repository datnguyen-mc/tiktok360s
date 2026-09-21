<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Concerns\WithSidebar;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Support\Seo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    use WithSidebar;

    public function __invoke(Request $request, Article $article): Response
    {
        abort_unless($article->status === 'published'
            || $request->user(), 404);

        $article->load('category:id,slug,name,color');

        // Đếm lượt xem không qua Eloquent để không đụng updated_at — cột đó là
        // tín hiệu "bài được sửa" mà Google có đọc.
        // Mỗi phiên chỉ tính một lần cho mỗi bài: bấm F5 mười lần không phải là
        // mười người đọc, và "Đọc nhiều" sẽ sai hoàn toàn nếu đếm như vậy.
        $seen = $request->session()->get('seen', []);
        if (! in_array($article->id, $seen, true)) {
            Article::whereKey($article->id)->update(['views' => $article->views + 1]);
            $article->views++;
            $seen[] = $article->id;
            $request->session()->put('seen', array_slice($seen, -200));
        }

        $userId = $request->user()?->id;

        $comments = Comment::with(['user:id,name,username,avatar_url'])
            ->where('article_id', $article->id)
            ->whereNull('parent_id')
            ->visible()
            ->withCount('replies')
            ->with(['replies' => fn ($q) => $q->visible()->with('user:id,name,username,avatar_url')])
            ->latest('id')
            ->limit(50)
            ->get();

        // Bình luận nào người đang xem đã thích — để tô tim sẵn
        $likedComments = $userId
            ? CommentLike::where('user_id', $userId)
                ->whereIn('comment_id', $comments->pluck('id')
                    ->merge($comments->pluck('replies')->flatten()->pluck('id')))
                ->pluck('comment_id')->all()
            : [];

        $related = Article::published()
            ->where('category_id', $article->category_id)
            ->whereKeyNot($article->id)
            ->latest('published_at')->limit(6)
            ->get(['id', 'title', 'slug', 'image_url', 'source', 'published_at']);

        return Inertia::render('Article', [
            'article' => [
                ...$article->toArray(),
                'url'             => $article->url(),
                'reading_minutes' => $article->readingMinutes(),
            ],
            'related'  => $related,
            'comments' => $comments,
            'state'    => [
                'liked'          => $userId && ArticleLike::where('article_id', $article->id)
                                        ->where('user_id', $userId)->exists(),
                'bookmarked'     => $userId && Bookmark::where('article_id', $article->id)
                                        ->where('user_id', $userId)->exists(),
                'likedComments'  => $likedComments,
            ],
            'sidebar' => $this->sidebar($article->id),
            'seo' => (new Seo(
                title: $article->seo_title ?: $article->title,
                description: $article->seo_description ?: $article->excerpt,
                image: $article->image_url,
                canonical: $article->url(),
                type: 'article',
                publishedAt: $article->published_at?->toIso8601String(),
                modifiedAt: $article->updated_at?->toIso8601String(),
                section: $article->category?->name,
                jsonLd: [
                    Seo::newsArticle([
                        ...$article->toArray(),
                        'url'          => $article->url(),
                        'published_at' => $article->published_at?->toIso8601String(),
                        'updated_at'   => $article->updated_at?->toIso8601String(),
                        'category'     => $article->category?->name,
                    ]),
                    Seo::breadcrumbs(array_filter([
                        ['name' => 'Trang chủ', 'url' => url('/')],
                        $article->category ? [
                            'name' => $article->category->name,
                            'url'  => $article->category->url(),
                        ] : null,
                        ['name' => $article->title, 'url' => $article->url()],
                    ])),
                ],
            ))->toArray(),
        ]);
    }
}
