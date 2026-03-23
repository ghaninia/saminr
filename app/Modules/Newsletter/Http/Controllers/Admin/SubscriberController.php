<?php

namespace App\Modules\Newsletter\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Http\Resources\SubscriberResource;
use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Newsletter\Services\Contracts\SubscriberServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriberController extends Controller
{
    public function __construct(private readonly SubscriberServiceInterface $subscriberService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $search = (string) $request->query('search', '');

        return SubscriberResource::collection(
            $this->subscriberService->listPaginated($search, 50)
        );
    }

    public function destroy(Subscriber $subscriber): JsonResponse
    {
        $this->subscriberService->delete($subscriber);

        return response()->json([
            'message' => 'Deleted.',
        ]);
    }
}
