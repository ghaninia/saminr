<?php

namespace Database\Seeders;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        ReviewFactory::new()->count(14)->create();
    }
}
