<?php

namespace App\Modules\Categories\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Categories\Http\Resources\CategoryResource;
use App\Modules\Categories\Services\Contracts\CategoryServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryServiceInterface $categoryService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            $this->categoryService->listAll(ascending: true)
        );
    }
}
