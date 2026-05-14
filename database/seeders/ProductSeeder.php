<?php

namespace Database\Seeders;

use Database\Factories\ProductFactory;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed products with multiple variants based on existing DB attributes.
     */
    public function run(): void
    {
        ProductFactory::new()->count(12)->create();
    }
}
