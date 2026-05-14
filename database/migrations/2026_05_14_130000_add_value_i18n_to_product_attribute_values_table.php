<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_attribute_values', function (Blueprint $table): void {
            $table->json('value_i18n')->nullable()->after('value');
        });

        DB::table('product_attribute_values')
            ->select(['id', 'value'])
            ->orderBy('id')
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    $value = (string) ($row->value ?? '');
                    DB::table('product_attribute_values')
                        ->where('id', $row->id)
                        ->update([
                            'value_i18n' => json_encode([
                                'fa' => $value,
                                'en' => $value,
                            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('product_attribute_values', function (Blueprint $table): void {
            $table->dropColumn('value_i18n');
        });
    }
};
