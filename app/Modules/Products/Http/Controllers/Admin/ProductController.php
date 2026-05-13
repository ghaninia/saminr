<?php

namespace App\Modules\Products\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }

    public function upload(ProductUploadRequest $request, Product $product): JsonResponse
    {
        $validated = $request->validated();
        $file = $request->file('file');
        if (! $file instanceof \Illuminate\Http\UploadedFile) {
            return response()->json([
                'message' => __('validation_messages.file.required'),
            ], 422);
        }

        $field = (string) ($validated['field'] ?? 'cover_image');

        $updated = $this->productService->upload($product, $file, $field);

        $gallery = is_array($updated->gallery) ? $updated->gallery : [];

        $url = match ($field) {
            'intro_video' => $updated->intro_video,
            'gallery' => $gallery ? $gallery[array_key_last($gallery)] : null,
            default => $updated->cover_image,
        };

        return response()->json([
            'url' => $url,
            'product' => (new ProductResource($updated))->resolve(),
        ]);
    }
}
