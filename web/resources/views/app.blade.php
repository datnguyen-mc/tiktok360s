<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Thẻ SEO do Inertia đặt từ từng trang (xem app/Support/Seo.php) --}}
    @inertiaHead

    @if (config('site.google_site_verification'))
        <meta name="google-site-verification" content="{{ config('site.google_site_verification') }}">
    @endif

    <link rel="icon" type="image/svg+xml" href="{{ config('site.logo') }}">
    <link rel="alternate" type="application/rss+xml"
          title="{{ config('site.name') }}" href="{{ url('/rss.xml') }}">

    {{-- preconnect tới nơi chứa ảnh báo: ảnh là thứ nặng nhất trên trang tin --}}
    <link rel="preconnect" href="https://kenh14cdn.com" crossorigin>
    <link rel="preconnect" href="https://i1-giaitri.vnecdn.net" crossorigin>

    @vite('resources/js/app.js')
</head>
<body class="bg-page text-ink antialiased">
    @inertia
</body>
</html>
