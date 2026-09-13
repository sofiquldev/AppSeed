<x-guest-layout title="Register">
    <h1>Create an account</h1>
    <form method="POST" action="{{ route('register') }}" class="form">
        @csrf
        <label>
            Name
            <input type="text" name="name" value="{{ old('name') }}" required autofocus>
            @error('name') <span class="error">{{ $message }}</span> @enderror
        </label>
        <label>
            Email
            <input type="email" name="email" value="{{ old('email') }}" required>
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
        <button type="submit" class="btn">Register</button>
        <p class="muted">Already have an account? <a href="{{ route('login') }}">Log in</a></p>
    </form>
</x-guest-layout>
