<x-app-layout title="Users" heading="Users">
    @if (session('status'))
        <p class="muted">{{ session('status') }}</p>
    @endif
    <section class="card">
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @foreach ($users as $user)
                    <tr>
                        <td>{{ $user->name }}</td>
                        <td>{{ $user->email }}</td>
                        <td>{{ $user->role }}</td>
                        <td><a href="{{ route('users.edit', $user) }}">Edit</a></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </section>
</x-app-layout>
