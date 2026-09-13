<x-app-layout title="Edit user" heading="Edit user">
    <section class="card" style="max-width: 480px;">
        <form method="POST" action="{{ route('users.update', $user) }}" class="form">
            @csrf
            @method('PUT')
            <label>
                Name
                <input type="text" name="name" value="{{ old('name', $user->name) }}" required>
                @error('name') <span class="error">{{ $message }}</span> @enderror
            </label>
            <label>
                Email
                <input type="email" name="email" value="{{ old('email', $user->email) }}" required>
                @error('email') <span class="error">{{ $message }}</span> @enderror
            </label>
            <label>
                Role
                <input type="text" name="role" value="{{ old('role', $user->role) }}" required>
                @error('role') <span class="error">{{ $message }}</span> @enderror
            </label>
            <button type="submit" class="btn">Save</button>
        </form>
    </section>
</x-app-layout>
