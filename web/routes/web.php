<?php

use App\Http\Controllers\Admin\ArticleAdminController;
use App\Http\Controllers\Admin\CategoryAdminController;
use App\Http\Controllers\Admin\CommentAdminController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PageAdminController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RoleAdminController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\Api\IngestArticleController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\Web\ArticleController;
use App\Http\Controllers\Web\CategoryController;
use App\Http\Controllers\Web\FeedController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\InteractionController;
use App\Http\Controllers\Web\PageController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\SearchController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\VerifyIngestToken;
use Illuminate\Support\Facades\Route;

/*
 | Tiền tố đường dẫn dùng tiếng Anh; phần định danh (slug bài, slug chuyên mục)
 | vẫn là tiếng Việt không dấu vì đó là nội dung, không phải tiền tố:
 |   /news/<slug>        bài viết
 |   /category/<slug>    chuyên mục
 |   /page/<slug>        trang tĩnh
 |   /search?q=          tìm kiếm
 |   /admin/...          khu quản trị
 |
 | Đường dẫn tiếng Việt cũ được chuyển hướng 301 ở cuối tệp — link đã chia sẻ
 | và những gì Google đã lập chỉ mục vẫn phải mở được.
 */

// ── Tệp cho máy đọc (đặt trước để không bị route bài viết nuốt) ──────────────
Route::get('/robots.txt', [FeedController::class, 'robots']);
Route::get('/sitemap.xml', [FeedController::class, 'sitemapIndex']);
Route::get('/sitemap-categories.xml', [FeedController::class, 'sitemapCategories']);
Route::get('/sitemap-news-{page}.xml', [FeedController::class, 'sitemapArticles'])
    ->whereNumber('page');
Route::get('/rss.xml', [FeedController::class, 'rss']);

// ── Dây chuyền đẩy tin vào ───────────────────────────────────────────────────
Route::post('/api/ingest/articles', IngestArticleController::class)
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
    ->middleware(VerifyIngestToken::class);

// ── Trang công khai ──────────────────────────────────────────────────────────
Route::get('/', HomeController::class)->name('home');
Route::get('/search', SearchController::class)->name('search');
Route::get('/category/{category}', CategoryController::class)->name('category');
Route::get('/page/{page}', PageController::class)->name('page');
Route::get('/news/{article}', ArticleController::class)->name('article');

// ── Tương tác của độc giả (phải đăng nhập) ──────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/news/{article}/like', [InteractionController::class, 'like']);
    Route::post('/news/{article}/save', [InteractionController::class, 'bookmark']);
    Route::post('/news/{article}/comment', [InteractionController::class, 'comment']);
    Route::post('/comments/{comment}/like', [InteractionController::class, 'likeComment']);
    Route::delete('/comments/{comment}', [InteractionController::class, 'deleteComment']);

    Route::get('/bookmarks', [ProfileController::class, 'bookmarks'])->name('bookmarks');
    Route::get('/account', [ProfileController::class, 'edit']);
    Route::put('/account', [ProfileController::class, 'update']);
});

// Chia sẻ đếm được kể cả khi chưa đăng nhập
Route::post('/news/{article}/share', [InteractionController::class, 'share']);

// ── Khu quản trị ────────────────────────────────────────────────────────────
// Hai lớp: `EnsureAdmin` hỏi "có được vào khu này không", `can.do:<quyền>` hỏi
// "có được làm việc cụ thể này không". Chỉ lớp ngoài là không đủ — biên tập
// viên sẽ xoá được tài khoản người khác.
Route::middleware(['auth', EnsureAdmin::class])->prefix('admin')->group(function () {
    Route::get('/', DashboardController::class)->name('admin.dashboard');

    // {article:id} chứ không phải {article}: Article bind mặc định theo slug
    // (cho URL công khai), còn bảng quản trị thì liên kết bằng id.
    Route::middleware('can.do:articles.view')->group(function () {
        Route::get('articles', [ArticleAdminController::class, 'index'])->name('admin.articles');
    });
    Route::middleware('can.do:articles.edit')->group(function () {
        Route::get('articles/new', [ArticleAdminController::class, 'create']);
        Route::post('articles', [ArticleAdminController::class, 'store']);
        Route::get('articles/{article:id}', [ArticleAdminController::class, 'edit']);
        Route::put('articles/{article:id}', [ArticleAdminController::class, 'update']);
        Route::patch('articles/{article:id}/toggle', [ArticleAdminController::class, 'toggle']);
    });
    Route::delete('articles/{article:id}', [ArticleAdminController::class, 'destroy'])
        ->middleware('can.do:articles.delete');

    Route::middleware('can.do:categories.view')->group(function () {
        Route::get('categories', [CategoryAdminController::class, 'index'])->name('admin.categories');
    });
    Route::middleware('can.do:categories.edit')->group(function () {
        Route::post('categories', [CategoryAdminController::class, 'store']);
        Route::put('categories/{category:id}', [CategoryAdminController::class, 'update']);
        Route::delete('categories/{category:id}', [CategoryAdminController::class, 'destroy']);
    });

    Route::middleware('can.do:pages.view')->group(function () {
        Route::get('pages', [PageAdminController::class, 'index'])->name('admin.pages');
    });
    Route::middleware('can.do:pages.edit')->group(function () {
        Route::post('pages', [PageAdminController::class, 'store']);
        Route::put('pages/{page}', [PageAdminController::class, 'update']);
        Route::delete('pages/{page}', [PageAdminController::class, 'destroy']);
    });

    Route::middleware('can.do:comments.view')->group(function () {
        Route::get('comments', [CommentAdminController::class, 'index'])->name('admin.comments');
    });
    Route::middleware('can.do:comments.moderate')->group(function () {
        Route::put('comments/{comment}', [CommentAdminController::class, 'update']);
        Route::delete('comments/{comment}', [CommentAdminController::class, 'destroy']);
    });

    Route::middleware('can.do:users.view')->group(function () {
        Route::get('users', [UserAdminController::class, 'index'])->name('admin.users');
    });
    Route::middleware('can.do:users.manage')->group(function () {
        Route::put('users/{user}', [UserAdminController::class, 'update']);
        Route::patch('users/{user}/verify', [UserAdminController::class, 'verify']);
        Route::delete('users/{user}', [UserAdminController::class, 'destroy']);
    });

    Route::get('reports', ReportController::class)
        ->middleware('can.do:reports.view')->name('admin.reports');

    Route::middleware('can.do:roles.manage')->group(function () {
        Route::get('roles', [RoleAdminController::class, 'index'])->name('admin.roles');
        Route::post('roles', [RoleAdminController::class, 'store']);
        Route::put('roles/{role}', [RoleAdminController::class, 'update']);
        Route::delete('roles/{role}', [RoleAdminController::class, 'destroy']);
    });

    Route::middleware('can.do:settings.manage')->group(function () {
        Route::get('settings', [SettingsController::class, 'edit'])->name('admin.settings');
        Route::put('settings', [SettingsController::class, 'update']);
    });
});

// ── Đăng ký / đăng nhập ─────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [SessionController::class, 'create'])->name('login');
    Route::post('/login', [SessionController::class, 'store']);
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

Route::post('/logout', [SessionController::class, 'destroy'])->middleware('auth');

/*
 | ── Đường dẫn tiếng Việt cũ ────────────────────────────────────────────────
 | 301 chứ không phải 302: nói với Google rằng địa chỉ đã chuyển hẳn, để thứ
 | hạng của đường dẫn cũ dồn sang đường dẫn mới thay vì bị chia đôi.
 */
$moved = [
    'tin/{rest}'        => 'news/{rest}',
    'chuyen-muc/{rest}' => 'category/{rest}',
    'trang/{rest}'      => 'page/{rest}',
    'tim-kiem'          => 'search',
    'dang-nhap'         => 'login',
    'dang-ky'           => 'register',
    'da-luu'            => 'bookmarks',
    'tai-khoan'         => 'account',
    'quan-tri'          => 'admin',
    'sitemap-chuyen-muc.xml' => 'sitemap-categories.xml',
];

foreach ($moved as $from => $to) {
    Route::get($from, function (?string $rest = null) use ($to) {
        $target = $rest === null ? $to : str_replace('{rest}', $rest, $to);

        return redirect('/'.$target.(request()->getQueryString()
            ? '?'.request()->getQueryString() : ''), 301);
    })->where('rest', '.*');
}

/*
 | Khu quản trị phải dịch cả phần sau tiền tố, không chỉ đổi `quan-tri` thành
 | `admin` — nếu chỉ đổi tiền tố thì /quan-tri/nguoi-dung rơi vào
 | /admin/nguoi-dung, một đường dẫn không tồn tại.
 */
$movedAdmin = [
    'tin/moi'     => 'articles/new',
    'tin'         => 'articles',
    'chuyen-muc'  => 'categories',
    'trang'       => 'pages',
    'binh-luan'   => 'comments',
    'nguoi-dung'  => 'users',
    'bao-cao'     => 'reports',
    'vai-tro'     => 'roles',
    'cau-hinh'    => 'settings',
];

Route::get('quan-tri/{rest}', function (string $rest) use ($movedAdmin) {
    foreach ($movedAdmin as $from => $to) {
        if ($rest === $from || str_starts_with($rest, $from.'/')) {
            $rest = $to.substr($rest, strlen($from));
            break;
        }
    }

    return redirect('/admin/'.$rest.(request()->getQueryString()
        ? '?'.request()->getQueryString() : ''), 301);
})->where('rest', '.*');
