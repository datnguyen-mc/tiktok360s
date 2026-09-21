<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CommentAdminController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Comments', [
            'comments' => Comment::with(['user:id,name,email', 'article:id,title,slug'])
                ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
                ->when($request->string('q')->toString(), fn ($q, $t) => $q->where('body', 'like', "%{$t}%"))
                ->latest('id')->paginate(30)->withQueryString(),
            'filters' => $request->only(['q', 'status']),
            'stats' => [
                'total'   => Comment::count(),
                'visible' => Comment::where('status', 'visible')->count(),
                'hidden'  => Comment::where('status', 'hidden')->count(),
                'spam'    => Comment::where('status', 'spam')->count(),
            ],
        ]);
    }

    public function update(Request $request, Comment $comment)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['visible', 'hidden', 'spam'])],
        ]);

        $comment->update($data);

        return back()->with('success', 'Đã cập nhật bình luận');
    }

    public function destroy(Comment $comment)
    {
        DB::transaction(function () use ($comment) {
            $count = 1 + $comment->replies()->count();
            $articleId = $comment->article_id;
            $comment->delete();
            Article::whereKey($articleId)->decrement('comments_count', $count);
        });

        return back()->with('success', 'Đã xoá bình luận');
    }
}
