<?php

namespace App\Modules\Newsletter\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Http\Resources\SubscriberResource;
use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Newsletter\Services\Contracts\SubscriberServiceInterface;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriberController extends Controller
{
    public function __construct(
        private readonly SubscriberServiceInterface $subscriberService,
        private readonly SettingServiceInterface $settingService,
    )
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $search = (string) $request->query('search', '');
        $defaultPerPage = (int) ($this->settingService->getValue('dashboard_items_per_page') ?? 10);
        $requestedPerPage = (int) $request->query('per_page', $defaultPerPage);
        $perPage = max(1, min(100, $requestedPerPage));

        return SubscriberResource::collection(
            $this->subscriberService->listPaginated($search, $perPage)
        );
    }

    public function destroy(Subscriber $subscriber): JsonResponse
    {
        $this->subscriberService->delete($subscriber);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }
}
