<?php

namespace App\Modules\Newsletter\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Http\Requests\Client\SubscriberStoreRequest;
use App\Modules\Newsletter\Services\Contracts\SubscriberServiceInterface;
use Illuminate\Http\JsonResponse;

class SubscriberController extends Controller
{
    public function __construct(private readonly SubscriberServiceInterface $subscriberService)
    {
    }

    public function store(SubscriberStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $subscriber = $this->subscriberService->subscribe(
            (string) $validated['fullname'],
            (string) $validated['email']
        );

        return response()->json([
            'message' => __('responses.newsletter.subscribed'),
            'data' => [
                'id' => $subscriber->getKey(),
                'fullname' => $subscriber->fullname,
                'email' => $subscriber->email,
            ],
        ], $subscriber->wasRecentlyCreated ? 201 : 200);
    }
}
