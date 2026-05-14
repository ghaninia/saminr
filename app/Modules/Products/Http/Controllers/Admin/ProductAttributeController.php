<?php

namespace App\Modules\Products\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Products\Http\Resources\ProductAttributeResource;
use App\Modules\Products\Services\Contracts\ProductServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductAttributeController extends Controller
{
    public function __construct(
        private readonly ProductServiceInterface $productService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ProductAttributeResource::collection(
            $this->productService->listAttributes()
        );
    }
}
