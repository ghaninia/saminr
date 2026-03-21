<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) env('DASHBOARD_ADMIN_EMAIL', 'admin@example.com');
        $name = (string) env('DASHBOARD_ADMIN_NAME', 'Admin');
        $password = (string) env('DASHBOARD_ADMIN_PASSWORD', 'admin123456');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'email_verified_at' => Carbon::now(),
            ],
        );
    }
}

