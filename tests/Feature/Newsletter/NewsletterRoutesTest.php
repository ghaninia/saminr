<?php

namespace Tests\Feature\Newsletter;

use App\Models\User;
use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use App\Modules\Newsletter\Jobs\SendNewsletterToSubscribersJob;
use App\Modules\Newsletter\Mail\NewsletterMailable;
use App\Modules\Newsletter\Models\Newsletter;
use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Newsletter\Services\Contracts\NewsletterServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NewsletterRoutesTest extends TestCase
{
    use RefreshDatabase;

    private function authCookieFor(User $user): string
    {
        return app(JwtServiceInterface::class)->issueForUser($user);
    }

    public function test_client_can_subscribe(): void
    {
        $response = $this->postJson('/api/client/subscribe', [
            'fullname' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'john@example.com');

        $this->assertSame(1, Subscriber::query()->count());
    }

    public function test_admin_can_list_subscribers(): void
    {
        Subscriber::query()->create([
            'fullname' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $user = User::factory()->create();
        $token = $this->authCookieFor($user);

        $response = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->getJson('/api/admin/subscribers');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'fullname', 'email', 'created_at'],
                ],
            ]);
    }

    public function test_admin_can_create_newsletter_and_queue_send_job(): void
    {
        Queue::fake();

        Subscriber::query()->create([
            'fullname' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $user = User::factory()->create();
        $token = $this->authCookieFor($user);

        $create = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->postJson('/api/admin/newsletters', [
                'subject' => 'Hello',
                'html' => '<h1>Hi</h1>',
            ]);

        $create
            ->assertCreated()
            ->assertJsonPath('data.subject', 'Hello');

        $newsletterId = (int) $create->json('data.id');
        $this->assertNotSame(0, $newsletterId);

        $send = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->postJson("/api/admin/newsletters/{$newsletterId}/send");

        $send->assertOk()->assertJsonPath('data.status', 'queued');

        Queue::assertPushed(SendNewsletterToSubscribersJob::class);
    }

    public function test_send_newsletter_job_sends_mail_and_marks_newsletter_sent(): void
    {
        Mail::fake();

        Subscriber::query()->create([
            'fullname' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        Subscriber::query()->create([
            'fullname' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);

        $newsletter = Newsletter::query()->create([
            'subject' => 'Hello',
            'html' => '<h1>Hi</h1>',
            'status' => 'queued',
            'queued_at' => now(),
        ]);

        $service = app(NewsletterServiceInterface::class);
        (new SendNewsletterToSubscribersJob((int) $newsletter->getKey()))->handle($service);

        $newsletter = $newsletter->fresh();
        $this->assertSame('sent', $newsletter->status);
        $this->assertSame(2, $newsletter->sent_count);
        $this->assertNotNull($newsletter->sent_at);

        Mail::assertSent(NewsletterMailable::class);
    }
}
