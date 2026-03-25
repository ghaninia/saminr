<?php

namespace App\Modules\Reviews\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Reviews\Http\Resources\ClientReviewResource;
use App\Modules\Reviews\Services\Contracts\ReviewServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewServiceInterface $reviewService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return ClientReviewResource::collection(
            $this->reviewService->listAll()
        );
    }
}
