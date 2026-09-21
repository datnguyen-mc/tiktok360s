<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Thích, lưu, chia sẻ, bình luận.
 *
 * Tất cả đều trả về `back()` để Inertia cập nhật tại chỗ — người đọc không bị
 * nhảy trang khi bấm tim giữa lúc đang đọc.
 */
class InteractionController extends Controller
{
    public function like(Request $request, Article $article)
    {
        $userId = $request->user()->id;

        $existing = ArticleLike::where('article_id', $article->id)
            ->where('user_id', $userId)->first();

        DB::transaction(function () use ($existing, $article, $userId) {
            if ($existing) {
                $existing->delete();
                $article->decrement('likes_count');
            } else {
                ArticleLike::create(['article_id' => $article->id, 'user_id' => $userId]);
                $article->increment('likes_count');
            }
        });

        return back(303);
    }

    public function bookmark(Request $request, Article $article)
    {
        $userId = $request->user()->id;

        $existing = Bookmark::where('article_id', $article->id)
            ->where('user_id', $userId)->first();

        DB::transaction(function () use ($existing, $article, $userId) {
            if ($existing) {
                $existing->delete();
                $article->decrement('bookmarks_count');
            } else {
                Bookmark::create(['article_id' => $article->id, 'user_id' => $userId]);
                $article->increment('bookmarks_count');
            }
        });

        return back(303);
    }

    /** Đếm lượt chia sẻ. Không cần đăng nhập — chia sẻ là hành vi công khai. */
    public function share(Article $article)
    {
        Article::whereKey($article->id)->increment('shares_count');

        return back(303);
    }

    public function comment(Request $request, Article $article)
    {
        $data = $request->validate([
            'body'      => ['required', 'string', 'min:2', 'max:2000'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ], [], ['body' => 'nội dung']);

        // Chỉ cho trả lời một cấp: trả lời của trả lời sẽ gắn vào bình luận gốc
        $parentId = null;
        if (! empty($data['parent_id'])) {
            $parent = Comment::find($data['parent_id']);
            $parentId = $parent?->parent_id ?: $parent?->id;
        }

        DB::transaction(function () use ($article, $request, $data, $parentId) {
            Comment::create([
                'article_id' => $article->id,
                'user_id'    => $request->user()->id,
                'parent_id'  => $parentId,
                'body'       => trim($data['body']),
            ]);
            $article->increment('comments_count');
        });

        return back(303);
    }

    public function likeComment(Request $request, Comment $comment)
    {
        $userId = $request->user()->id;

        $existing = CommentLike::where('comment_id', $comment->id)
            ->where('user_id', $userId)->first();

        DB::transaction(function () use ($existing, $comment, $userId) {
            if ($existing) {
                $existing->delete();
                $comment->decrement('likes_count');
            } else {
                CommentLike::create(['comment_id' => $comment->id, 'user_id' => $userId]);
                $comment->increment('likes_count');
            }
        });

        return back(303);
    }

    /** Người viết tự xoá bình luận của mình; quản trị xoá được mọi bình luận. */
    public function deleteComment(Request $request, Comment $comment)
    {
        abort_unless($comment->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        DB::transaction(function () use ($comment) {
            $count = 1 + $comment->replies()->count();
            $comment->delete();
            Article::whereKey($comment->article_id)->decrement('comments_count', $count);
        });

        return back(303);
    }
}
