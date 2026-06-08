<?php

namespace App\Modules\Products\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Products\Http\Resources\GuestProductResource;
use App\Modules\Products\Services\Contracts\GuestProductServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        private readonly GuestProductServiceInterface $guestProductService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $raw = $request->query('categories');

        if ($raw !== null && $raw !== '') {
            $slugs = array_values(
                array_filter(
                    array_map('trim', explode(',', (string) $raw)),
                    fn (string $s): bool => $s !== ''
                )
            );

            if ($slugs !== []) {
                return GuestProductResource::collection(
                    $this->guestProductService->listForGuestByCategories($slugs)
                );
            }
        }

        return GuestProductResource::collection(
            $this->guestProductService->listForGuest()
        );
    }

    public function show(string $shortLink): GuestProductResource|JsonResponse
    {
        $product = $this->guestProductService->findForGuest($shortLink);

        if ($product === null) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return new GuestProductResource($product);
    }
}
