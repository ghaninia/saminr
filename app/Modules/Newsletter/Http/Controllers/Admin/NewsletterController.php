<?php

namespace App\Modules\Newsletter\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Exceptions\NewsletterAlreadyQueuedException;
use App\Modules\Newsletter\Exceptions\NoSubscribersFoundException;
use App\Modules\Newsletter\Http\Requests\Admin\NewsletterStoreRequest;
use App\Modules\Newsletter\Http\Resources\NewsletterResource;
use App\Modules\Newsletter\Jobs\SendNewsletterToSubscribersJob;
use App\Modules\Newsletter\Models\Newsletter;
use App\Modules\Newsletter\Services\Contracts\NewsletterServiceInterface;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsletterController extends Controller
{
    public function __construct(
        private readonly NewsletterServiceInterface $newsletterService,
        private readonly SettingServiceInterface $settingService,
    )
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $defaultPerPage = (int) ($this->settingService->getValue('dashboard_items_per_page') ?? 10);
        $requestedPerPage = (int) $request->query('per_page', $defaultPerPage);
        $perPage = max(1, min(100, $requestedPerPage));

        return NewsletterResource::collection($this->newsletterService->listPaginated($perPage));
    }

    public function store(NewsletterStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $newsletter = $this->newsletterService->create((string) $validated['subject'], (string) $validated['html']);

        /** @var JsonResponse $response */
        $response = (new NewsletterResource($newsletter))->response();

        return $response->setStatusCode(201);
    }

    public function send(Newsletter $newsletter): JsonResponse
    {
        try {
            $newsletter = $this->newsletterService->queueSend($newsletter);
        } catch (NewsletterAlreadyQueuedException) {
            return response()->json([
                'message' => __('responses.newsletter.already_queued'),
            ], 409);
        } catch (NoSubscribersFoundException) {
            return response()->json([
                'message' => __('responses.newsletter.no_subscribers'),
            ], 422);
        }

        SendNewsletterToSubscribersJob::dispatch((int) $newsletter->getKey());

        return (new NewsletterResource($newsletter->fresh()))
            ->additional(['message' => __('responses.newsletter.queued')])
            ->response();
    }
}
