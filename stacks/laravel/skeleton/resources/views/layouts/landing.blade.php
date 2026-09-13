<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('app.name') }}</title>
    <!-- {{APPSEED_TAGLINE}} · {{APPSEED_URL}} -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <header class="landing-nav">
        <a class="brand" href="{{ route('home') }}">{{ config('app.name') }}</a>
        <nav>
            @auth
                <a href="{{ route('dashboard') }}">Dashboard</a>
            @else
                <a href="{{ route('login') }}">Log in</a>
                <a class="btn" href="{{ route('register') }}">Get started</a>
            @endauth
        </nav>
    </header>
    {{ $slot }}
    <footer class="landing-foot">
        <a class="muted appseed-footprint" href="{{APPSEED_URL}}" rel="nofollow noopener">{{APPSEED_CREDIT}}</a>
    </footer>
</body>
</html>
