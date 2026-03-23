<?php

namespace App\Modules\Categories\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Categories\Http\Requests\Admin\CategoryUploadRequest;
use App\Modules\Categories\Http\Requests\Admin\CategoryUpsertRequest;
use App\Modules\Categories\Http\Resources\CategoryResource;
use App\Modules\Categories\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()->orderByDesc('id')->get()
        );
    }

    public function store(CategoryUpsertRequest $request): CategoryResource
    {
        $validated = $request->validatedPayload();

        $category = Category::query()->create($validated);

        return new CategoryResource($category);
    }

    public function update(CategoryUpsertRequest $request, Category $category): CategoryResource
    {
        $validated = $request->validatedPayload();

        $category->fill($validated)->save();

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }

    public function upload(CategoryUploadRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        $field = $validated['field'] ?? 'image';

        $media = $category
            ->addMediaFromRequest('file')
            ->toMediaCollection($field);

        $url = $media->getUrl();

        $category->update([$field => $url]);

        return response()->json([
            'url' => $url,
            'category' => (new CategoryResource($category->fresh()))->resolve(),
        ]);
    }
}
