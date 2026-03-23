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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsletterController extends Controller
{
    public function __construct(private readonly NewsletterServiceInterface $newsletterService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return NewsletterResource::collection($this->newsletterService->listPaginated(50));
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

        return response()->json([
            'message' => __('responses.newsletter.queued'),
            'data' => (new NewsletterResource($newsletter->fresh()))->resolve(),
        ]);
    }
}
