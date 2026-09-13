<x-landing-layout title="{{ config('app.name') }}">
    <section class="hero">
        <p class="eyebrow">Landing 01</p>
        <h1>A starter you can actually give a client.</h1>
        <p class="lede">Auth, a dashboard, and this page. Change tokens if you want it darker or louder. Do not rewrite the shell.</p>
        <div class="actions">
            <a class="btn" href="{{ route('register') }}">Create an account</a>
            <a class="btn ghost" href="{{ route('login') }}">Log in</a>
        </div>
    </section>
    <section class="features">
        <article>
            <h3>Auth included</h3>
            <p>Session login and registration. Password reset if you turned that feature on.</p>
        </article>
        <article>
            <h3>Dashboard shell</h3>
            <p>Sidebar layout. Tokens for light / dark / brand.</p>
        </article>
        <article>
            <h3>Runs locally</h3>
            <p><code>composer install</code>, migrate, <code>php artisan serve</code>.</p>
        </article>
    </section>
</x-landing-layout>
