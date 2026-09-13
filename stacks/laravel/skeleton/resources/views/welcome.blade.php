<x-landing-layout title="{{ config('app.name') }}">
    <section class="hero">
        <p class="eyebrow">Project starter</p>
        <h1>Ship the boring parts once.</h1>
        <p class="lede">Auth, a dashboard, and a landing page you can hand to a client without rebuilding the same shell.</p>
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
            <p>Sidebar layout, tokens for light / dark / brand. Change the theme file, not twenty views.</p>
        </article>
        <article>
            <h3>Runs locally</h3>
            <p><code>composer install</code>, migrate, <code>php artisan serve</code>.</p>
        </article>
    </section>
</x-landing-layout>
