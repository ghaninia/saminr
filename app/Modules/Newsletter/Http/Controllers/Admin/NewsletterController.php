<?php

namespace App\Modules\Newsletter\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Newsletter\Http\Resources\NewsletterResource;
use App\Modules\Newsletter\Jobs\SendNewsletterToSubscribersJob;
use App\Modules\Newsletter\Models\Newsletter;
use App\Modules\Newsletter\Services\Contracts\NewsletterServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'html' => ['required', 'string'],
        ]);

        $newsletter = $this->newsletterService->create((string) $validated['subject'], (string) $validated['html']);

        /** @var JsonResponse $response */
        $response = (new NewsletterResource($newsletter))->response();

        return $response->setStatusCode(201);
    }

    public function send(Newsletter $newsletter): JsonResponse
    {
        try {
            $newsletter = $this->newsletterService->queueSend($newsletter);
        } catch (\RuntimeException $e) {
            $message = $e->getMessage();
            $status = $message === 'This newsletter is already queued.' ? 409 : 422;

            return response()->json(['message' => $message], $status);
        }

        SendNewsletterToSubscribersJob::dispatch((int) $newsletter->getKey());

        return response()->json([
            'message' => 'Newsletter queued.',
            'data' => (new NewsletterResource($newsletter->fresh()))->resolve(),
        ]);
    }
}
