<?php

namespace App\Modules\Newsletter\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Services\Contracts\SubscriberServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function __construct(private readonly SubscriberServiceInterface $subscriberService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $subscriber = $this->subscriberService->subscribe(
            (string) $validated['fullname'],
            (string) $validated['email']
        );

        return response()->json([
            'message' => 'Subscribed.',
            'data' => [
                'id' => $subscriber->getKey(),
                'fullname' => $subscriber->fullname,
                'email' => $subscriber->email,
            ],
        ], $subscriber->wasRecentlyCreated ? 201 : 200);
    }
}
