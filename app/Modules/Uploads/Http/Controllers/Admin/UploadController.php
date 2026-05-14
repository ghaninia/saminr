<?php

namespace App\Modules\Uploads\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Uploads\Exceptions\SettingUploadNotAllowedException;
use App\Modules\Uploads\Http\Requests\Admin\UploadStoreRequest;
use App\Modules\Uploads\Services\Contracts\UploadServiceInterface;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    public function __construct(
        private readonly UploadServiceInterface $uploadService,
    ) {}

    public function store(UploadStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $result = $this->uploadService->storeForSetting(
                (int) $validated['setting_id'],
                $request->file('file'),
            );
        } catch (SettingUploadNotAllowedException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($result);
    }
}
