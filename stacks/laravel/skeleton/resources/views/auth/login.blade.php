<x-guest-layout title="Log in">
    <h1>Log in</h1>
    <form method="POST" action="{{ route('login') }}" class="form">
        @csrf
        <label>
            Email
            <input type="email" name="email" value="{{ old('email') }}" required autofocus>
            @error('email') <span class="error">{{ $message }}</span> @enderror
        </label>
        <label>
            Password
            <input type="password" name="password" required>
        </label>
        <label class="inline">
            <input type="checkbox" name="remember"> Remember me
        </label>
        <button type="submit" class="btn">Log in</button>
        <p class="muted">No account? <a href="{{ route('register') }}">Register</a></p>
        {{-- <appseed:auth-extra> --}}
        {{-- </appseed:auth-extra> --}}
    </form>
</x-guest-layout>
