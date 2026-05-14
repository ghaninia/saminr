<?php

namespace App\Modules\Reviews\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Reviews\Http\Requests\Admin\ReviewUploadRequest;
use App\Modules\Reviews\Http\Requests\Admin\ReviewUpsertRequest;
use App\Modules\Reviews\Http\Resources\ReviewResource;
use App\Modules\Reviews\Models\Review;
use App\Modules\Reviews\Services\Contracts\ReviewServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewServiceInterface $reviewService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ReviewResource::collection(
            $this->reviewService->listAll()
        );
    }

    public function store(ReviewUpsertRequest $request): ReviewResource
    {
        $review = $this->reviewService->create($request->validatedPayload());

        return new ReviewResource($review);
    }

    public function update(ReviewUpsertRequest $request, Review $review): ReviewResource
    {
        $updated = $this->reviewService->update($review, $request->validatedPayload());

        return new ReviewResource($updated);
    }

    public function destroy(Review $review): JsonResponse
    {
        $this->reviewService->delete($review);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }

    public function upload(ReviewUploadRequest $request, Review $review): JsonResponse
    {
        $file = $request->file('file');

        $url = $this->reviewService->uploadAvatar($review, $file);

        return (new ReviewResource($review->fresh()))
            ->additional(['url' => $url])
            ->response();
    }
}
