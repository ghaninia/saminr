<?php

namespace App\Modules\Contacts\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Modules\Contacts\Http\Requests\Client\ContactMessageStoreRequest;
use App\Modules\Contacts\Services\Contracts\ContactMessageServiceInterface;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __construct(
        private readonly ContactMessageServiceInterface $contactService,
    ) {
    }

    public function store(ContactMessageStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->contactService->create(
            (string) $validated['fullname'],
            (string) $validated['email'],
            (string) $validated['content'],
        );

        return response()->json([
            'message' => __('responses.contact.sent'),
        ], 201);
    }
}
