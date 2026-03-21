<?php

namespace App\Modules\Categories\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Categories\Http\Resources\CategoryResource;
use App\Modules\Categories\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()->orderBy('id')->get()
        );
    }
}

