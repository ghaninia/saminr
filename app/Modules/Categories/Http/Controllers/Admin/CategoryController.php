<?php

namespace App\Modules\Categories\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Categories\Http\Requests\Admin\CategoryUploadRequest;
use App\Modules\Categories\Http\Requests\Admin\CategoryUpsertRequest;
use App\Modules\Categories\Http\Resources\CategoryResource;
use App\Modules\Categories\Models\Category;
use App\Modules\Categories\Services\Contracts\CategoryServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryServiceInterface $categoryService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            $this->categoryService->listAll()
        );
    }

    public function store(CategoryUpsertRequest $request): CategoryResource
    {
        $category = $this->categoryService->create($request->validatedPayload());

        return new CategoryResource($category);
    }

    public function update(CategoryUpsertRequest $request, Category $category): CategoryResource
    {
        $updated = $this->categoryService->update($category, $request->validatedPayload());

        return new CategoryResource($updated);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }

    public function upload(CategoryUploadRequest $request, Category $category): JsonResponse
    {
        $field = (string) ($request->validated()['field'] ?? 'image');

        $result = $this->categoryService->upload($category, $request->file('file'), $field);

        return response()->json([
            'url'      => $result['url'],
            'category' => (new CategoryResource($result['category']))->resolve(),
        ]);
    }
}
