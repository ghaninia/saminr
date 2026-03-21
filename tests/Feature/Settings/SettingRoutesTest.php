<?php

namespace Tests\Feature\Settings;

use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_settings_route_returns_settings_list(): void
    {
        $this->seed(SettingSeeder::class);

        $response = $this->getJson('/api/client/settings');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'key', 'value', 'default', 'type'],
                ],
            ]);

        $this->assertCount(20, $response->json('data'));

        $this->assertSloganStructure($response->json('data'));
    }

    public function test_admin_settings_route_returns_settings_list(): void
    {
        $this->seed(SettingSeeder::class);

        $response = $this->getJson('/api/admin/settings');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'key', 'value', 'default', 'type'],
                ],
            ]);

        $this->assertCount(20, $response->json('data'));

        $this->assertSloganStructure($response->json('data'));
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
