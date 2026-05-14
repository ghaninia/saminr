<?php

namespace App\Modules\Products\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Products\DTOs\GuestProductDto;
use App\Modules\Products\Services\Contracts\GuestProductServiceInterface;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(
        private readonly GuestProductServiceInterface $guestProductService,
    ) {}

    public function index(): JsonResponse
    {
        $products = $this->guestProductService->listForGuest();

        return response()->json([
            'data' => array_map(
                static fn (GuestProductDto $product): array => $product->toArray(),
                $products,
            ),
        ]);
    }
}
