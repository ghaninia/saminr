<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use App\Modules\Settings\Models\Setting;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingRoutesTest extends TestCase
{
    use RefreshDatabase;

    private function authCookieFor(User $user): string
    {
        return app(JwtServiceInterface::class)->issueForUser($user);
    }

    public function test_client_settings_route_returns_settings_list(): void
    {
        $this->seed(SettingSeeder::class);
        $expectedCount = Setting::query()->count();

        $response = $this->getJson('/api/client/settings');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'key', 'value', 'default', 'type'],
                ],
            ]);

        $this->assertGreaterThan(0, $expectedCount);
        $this->assertCount($expectedCount, $response->json('data'));

        $this->assertSloganStructure($response->json('data'));
    }

    public function test_admin_settings_route_returns_settings_list(): void
    {
        $this->seed(SettingSeeder::class);
        $expectedCount = Setting::query()->count();

        $user = User::factory()->create();
        $token = $this->authCookieFor($user);

        $response = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->getJson('/api/admin/settings');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'key', 'value', 'default', 'type'],
                ],
            ]);

        $this->assertGreaterThan(0, $expectedCount);
        $this->assertCount($expectedCount, $response->json('data'));

        $this->assertSloganStructure($response->json('data'));
    }

    public function test_admin_can_update_single_setting_value(): void
    {
        $this->seed(SettingSeeder::class);

        $user = User::factory()->create();
        $token = $this->authCookieFor($user);

        $setting = Setting::query()->where('key', 'phone')->firstOrFail();

        $response = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->patchJson("/api/admin/settings/{$setting->id}", [
                'value' => '02199999999',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.key', 'phone')
            ->assertJsonPath('data.value', '02199999999');

        $this->assertSame('02199999999', $setting->fresh()->value);
    }

    public function test_admin_can_update_multiple_localized_setting_value(): void
    {
        $this->seed(SettingSeeder::class);

        $user = User::factory()->create();
        $token = $this->authCookieFor($user);

        $setting = Setting::query()->where('key', 'title')->firstOrFail();

        $payload = [
            'fa' => 'تیتر جدید',
            'en' => 'New title',
        ];

        $response = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->patchJson("/api/admin/settings/{$setting->id}", [
                'value' => $payload,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.key', 'title')
            ->assertJsonPath('data.value.fa', $payload['fa'])
            ->assertJsonPath('data.value.en', $payload['en']);

        $this->assertSame($payload['fa'], $setting->fresh()->value['fa']);
        $this->assertSame($payload['en'], $setting->fresh()->value['en']);
    }

    public function test_admin_can_upload_files_for_link_settings(): void
    {
        Storage::fake('public');
        $this->seed(SettingSeeder::class);

        $user = User::factory()->create();
        $token = $this->authCookieFor($user);

        $setting = Setting::query()->where('key', 'favicon')->firstOrFail();
        $file = UploadedFile::fake()->image('logo.png', 256, 256);

        $response = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('dashboard_jwt.cookie'), $token)
            ->post('/api/admin/uploads', [
                'file' => $file,
                'setting_id' => $setting->id,
            ]);

        $response->assertOk()->assertJsonStructure(['url', 'setting' => ['id', 'key', 'value', 'type']]);
        $this->assertSame($setting->id, $response->json('setting.id'));
        $this->assertSame('favicon', $response->json('setting.key'));
        $this->assertNotEmpty((string) $response->json('url'));

        $this->assertNotEmpty(Storage::disk('public')->allFiles('uploads'));
    }

    /**
     * @param array<int, array<string, mixed>> $data
     */
    private function assertSloganStructure(array $data): void
    {
        $slogan = collect($data)->firstWhere('key', 'slogan');

        $this->assertNotNull($slogan);
        $this->assertSame('multiple', $slogan['type']);
        $this->assertIsArray($slogan['value']);
        $this->assertCount(7, $slogan['value']);
        $this->assertArrayHasKey('fa', $slogan['value'][0]);
        $this->assertArrayHasKey('en', $slogan['value'][0]);
    }
}
