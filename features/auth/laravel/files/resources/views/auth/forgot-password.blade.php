<x-guest-layout title="Forgot password">
    <h1>Forgot password</h1>
    @if (session('status'))
        <p class="muted">{{ session('status') }}</p>
    @endif
    <form method="POST" action="{{ route('password.email') }}" class="form">
        @csrf
        <label>
            Email
            <input type="email" name="email" value="{{ old('email') }}" required autofocus>
            @error('email') <span class="error">{{ $message }}</span> @enderror
        </label>
        <button type="submit" class="btn">Email reset link</button>
        <p class="muted"><a href="{{ route('login') }}">Back to login</a></p>
    </form>
</x-guest-layout>
