<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table): void {
            if (Schema::hasColumn('product_variants', 'sku_type')) {
                $table->renameColumn('sku_type', 'unit_type');
            }

            if (Schema::hasColumn('product_variants', 'sku')) {
                $table->renameColumn('sku', 'unit');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table): void {
            if (Schema::hasColumn('product_variants', 'unit_type')) {
                $table->renameColumn('unit_type', 'sku_type');
            }

            if (Schema::hasColumn('product_variants', 'unit')) {
                $table->renameColumn('unit', 'sku');
            }
        });
    }
};
