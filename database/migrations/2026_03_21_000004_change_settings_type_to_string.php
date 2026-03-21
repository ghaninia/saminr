<?php

use App\Modules\Settings\Enums\SettingType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('settings')) {
            return;
        }

        // Convert the enum-backed `type` column into a plain string so we can extend types over time.
        Schema::rename('settings', 'settings_old');

        // SQLite keeps index names global across renamed tables.
        // Drop the old unique index name so we can recreate it on the new table.
        try {
            DB::statement('DROP INDEX IF EXISTS settings_key_unique');
        } catch (\Throwable) {
            // ignore
        }

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->longText('default')->nullable();
            $table->string('type');
            $table->timestamps();
        });

        $rows = DB::table('settings_old')->orderBy('id')->get([
            'id',
            'key',
            'value',
            'default',
            'type',
            'created_at',
            'updated_at',
        ]);

        foreach ($rows as $row) {
            DB::table('settings')->insert([
                'id' => $row->id,
                'key' => $row->key,
                'value' => $row->value,
                'default' => $row->default,
                'type' => $row->type,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        Schema::drop('settings_old');
    }

    public function down(): void
    {
        if (! Schema::hasTable('settings')) {
            return;
        }

        Schema::rename('settings', 'settings_new');

        try {
            DB::statement('DROP INDEX IF EXISTS settings_key_unique');
        } catch (\Throwable) {
            // ignore
        }

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->longText('default')->nullable();
            $table->enum('type', array_column(SettingType::cases(), 'value'));
            $table->timestamps();
        });

        $rows = DB::table('settings_new')->orderBy('id')->get([
            'id',
            'key',
            'value',
            'default',
            'type',
            'created_at',
            'updated_at',
        ]);

        foreach ($rows as $row) {
            DB::table('settings')->insert([
                'id' => $row->id,
                'key' => $row->key,
                'value' => $row->value,
                'default' => $row->default,
                'type' => $row->type,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        Schema::drop('settings_new');
    }
};
