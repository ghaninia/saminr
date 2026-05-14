<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('product_attribute_values', 'value_i18n')) {
            return;
        }

        Schema::table('product_attribute_values', function (Blueprint $table): void {
            $table->dropColumn('value_i18n');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('product_attribute_values', 'value_i18n')) {
            return;
        }

        Schema::table('product_attribute_values', function (Blueprint $table): void {
            $table->json('value_i18n')->nullable()->after('value');
        });
    }
};
