<x-app-layout title="Dashboard" heading="Overview">
    <section class="stats">
        <article>
            <span class="muted">Signed in as</span>
            <strong>{{ $user->name }}</strong>
        </article>
        <article>
            <span class="muted">Role</span>
            <strong>{{ $user->role }}</strong>
        </article>
        <article>
            <span class="muted">Email</span>
            <strong>{{ $user->email }}</strong>
        </article>
    </section>
    <section class="card">
        <h2>Recent activity</h2>
        <p class="muted">Dashboard 01. User CRUD shows up when you generate with the users feature.</p>
    </section>
</x-app-layout>
