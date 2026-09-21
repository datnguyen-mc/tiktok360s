<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /** Danh sách bài đã lưu của người đang đăng nhập. */
    public function bookmarks(Request $request)
    {
        $articles = Bookmark::where('user_id', $request->user()->id)
            ->with('article.category:id,slug,name,color')
            ->latest('id')
            ->paginate(18);

        return Inertia::render('Bookmarks', [
            'bookmarks' => $articles,
            'seo' => (new Seo(title: 'Bài đã lưu', description: 'Những bài bạn đã lưu lại.',
                              noindex: true))->toArray(),
        ]);
    }

    public function edit(Request $request)
    {
        return Inertia::render('Account', [
            'seo' => (new Seo(title: 'Tài khoản', noindex: true))->toArray(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'       => ['required', 'string', 'max:60'],
            'username'   => ['nullable', 'string', 'max:40', 'alpha_dash',
                             Rule::unique('users', 'username')->ignore($user->id)],
            'bio'        => ['nullable', 'string', 'max:300'],
            'avatar_url' => ['nullable', 'url', 'max:1000'],
        ], [], ['name' => 'tên', 'username' => 'tên đăng nhập']);

        $user->update($data);

        return back()->with('success', 'Đã lưu thông tin');
    }
}
