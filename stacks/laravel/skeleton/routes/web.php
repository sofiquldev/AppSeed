<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // <appseed:routes>
    // </appseed:routes>
});

require __DIR__.'/auth.php';
