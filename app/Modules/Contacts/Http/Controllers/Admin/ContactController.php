<?php

namespace App\Modules\Contacts\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Contacts\Http\Requests\Admin\ContactReplyRequest;
use App\Modules\Contacts\Http\Resources\ContactMessageResource;
use App\Modules\Contacts\Models\ContactMessage;
use App\Modules\Contacts\Services\Contracts\ContactMessageServiceInterface;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContactController extends Controller
{
    public function __construct(
        private readonly ContactMessageServiceInterface $contactService,
        private readonly SettingServiceInterface $settingService,
    ) {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $search = (string) $request->query('search', '');
        $defaultPerPage = (int) ($this->settingService->getValue('dashboard_items_per_page') ?? 10);
        $requestedPerPage = (int) $request->query('per_page', $defaultPerPage);
        $perPage = max(1, min(100, $requestedPerPage));

        return ContactMessageResource::collection(
            $this->contactService->listPaginated($search, $perPage)
        );
    }

    public function markRead(ContactMessage $contactMessage): JsonResponse
    {
        $this->contactService->markRead($contactMessage);

        return response()->json([
            'message' => __('responses.contact.marked_read'),
        ]);
    }

    public function reply(ContactReplyRequest $request, ContactMessage $contactMessage): JsonResponse
    {
        $validated = $request->validated();

        $this->contactService->reply($contactMessage, (string) $validated['content']);

        return response()->json([
            'message' => __('responses.contact.replied'),
        ]);
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $this->contactService->delete($contactMessage);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }
}
