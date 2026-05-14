<?php

namespace App\Modules\Users\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use App\Modules\Users\Http\Requests\Admin\UserStatusRequest;
use App\Modules\Users\Http\Requests\Admin\UserUploadRequest;
use App\Modules\Users\Http\Requests\Admin\UserUpsertRequest;
use App\Modules\Users\Http\Resources\UserResource;
use App\Modules\Users\Services\Contracts\UserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(
        private readonly UserServiceInterface $userService,
        private readonly SettingServiceInterface $settingService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $search = (string) $request->query('search', '');
        $defaultPerPage = (int) ($this->settingService->getValue('dashboard_items_per_page') ?? 10);
        $requestedPerPage = (int) $request->query('per_page', $defaultPerPage);
        $perPage = max(1, min(100, $requestedPerPage));

        return UserResource::collection(
            $this->userService->listPaginated($search, $perPage)
        );
    }

    public function store(UserUpsertRequest $request): UserResource
    {
        $user = $this->userService->create($request->validatedPayload());

        return new UserResource($user);
    }

    public function update(UserUpsertRequest $request, User $user): UserResource
    {
        $updated = $this->userService->update($user, $request->validatedPayload());

        return new UserResource($updated);
    }

    public function setStatus(UserStatusRequest $request, User $user): UserResource
    {
        /** @var User $actor */
        $actor = $request->user();

        $updated = $this->userService->setStatus(
            $user,
            (bool) $request->validated('is_active'),
            $actor,
        );

        return new UserResource($updated);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        $this->userService->softDelete($user, $actor);

        return response()->json([
            'message' => __('responses.common.deleted'),
        ]);
    }

    public function upload(UserUploadRequest $request, User $user): JsonResponse
    {
        $file = $request->file('file');

        $url = $this->userService->uploadAvatar($user, $file);

        return response()->json([
            'url' => $url,
            'user' => (new UserResource($user->fresh()))->resolve(),
        ]);
    }
}
