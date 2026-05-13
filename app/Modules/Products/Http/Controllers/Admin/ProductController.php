<?php

namespace App\Modules\Products\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Products\Http\Requests\Admin\ProductDeleteMediaRequest;
use App\Modules\Products\Http\Requests\Admin\ProductSetStatusRequest;
use App\Modules\Products\Http\Requests\Admin\ProductUploadRequest;
use App\Modules\Products\Http\Requests\Admin\ProductUpsertRequest;
use App\Modules\Products\Http\Resources\ProductResource;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Services\Contracts\ProductServiceInterface;
use Illuminate\Http\JsonResponse;
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

    public function show(Product $product): ProductResource
    {
        return new ProductResource($this->productService->find($product));
    }

    public function store(ProductUpsertRequest $request): ProductResource
    {
        $product = $this->productService->create($request->validatedPayload());

        return new ProductResource($product);
    }

    public function update(ProductUpsertRequest $request, Product $product): ProductResource
    {
        $updated = $this->productService->update($product, $request->validatedPayload());

        return new ProductResource($updated);
    }

    public function setStatus(ProductSetStatusRequest $request, Product $product): ProductResource
    {
        $updated = $this->productService->setStatus($product, $request->isActive());

        return new ProductResource($updated);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }

    public function upload(ProductUploadRequest $request, Product $product): JsonResponse
    {
        $result = $this->productService->uploadMedia($product, $request->uploadedFile(), $request->field());

        return response()->json([
            'url' => $result['url'],
            'product' => (new ProductResource($result['product']))->resolve(),
        ]);
    }

    public function deleteMedia(ProductDeleteMediaRequest $request, Product $product): JsonResponse
    {
        $updated = $this->productService->deleteMedia($product, $request->field(), $request->mediaIndex());

        return response()->json([
            'product' => (new ProductResource($updated))->resolve(),
        ]);
    }
}
