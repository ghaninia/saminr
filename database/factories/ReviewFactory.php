<?php

namespace Database\Factories;

use App\Modules\Reviews\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Review> */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $firstNamesFa = ['علی', 'مریم', 'رضا', 'زهرا', 'سارا', 'امیر', 'الناز', 'حسام', 'پریسا', 'مانی'];
        $lastNamesFa = ['رضایی', 'کریمی', 'موسوی', 'جعفری', 'مرادی', 'حسینی', 'احمدی', 'سلطانی', 'نوری', 'خدادادی'];

        $fullnameEn = fake()->name();
        $fullnameFa = fake()->randomElement($firstNamesFa).' '.fake()->randomElement($lastNamesFa);

        return [
            'fullname' => [
                'fa' => $fullnameFa,
                'en' => $fullnameEn,
            ],
            'review' => [
                'fa' => 'کیفیت محصول خوب بود و از خریدم راضی هستم.',
                'en' => fake()->sentences(2, true),
            ],
            'star' => fake()->numberBetween(3, 5),
            'avatar' => null,
            'user_type' => fake()->randomElement(['customer', 'customer', 'customer', 'admin', 'founder']),
        ];
    }
}
