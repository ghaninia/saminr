<?php

namespace App\Modules\Products\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Products\Http\Resources\ProductResource;
use App\Modules\Products\Services\Contracts\ProductServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductServiceInterface $productService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ProductResource::collection(
            $this->productService->listAll()
        );
    }
}
