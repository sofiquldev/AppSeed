<x-guest-layout title="Reset password">
    <h1>Reset password</h1>
    <form method="POST" action="{{ route('password.store') }}" class="form">
        @csrf
        <input type="hidden" name="token" value="{{ $token }}">
        <label>
            Email
            <input type="email" name="email" value="{{ old('email', $email) }}" required>
            @error('email') <span class="error">{{ $message }}</span> @enderror
        </label>
        <label>
            Password
            <input type="password" name="password" required>
            @error('password') <span class="error">{{ $message }}</span> @enderror
        </label>
        <label>
            Confirm password
            <input type="password" name="password_confirmation" required>
        </label>
        <button type="submit" class="btn">Reset password</button>
    </form>
</x-guest-layout>
