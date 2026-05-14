<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_attributes', function (Blueprint $table): void {
            $table->text('icon_svg')->nullable()->after('label');
        });
    }

    public function down(): void
    {
        Schema::table('product_attributes', function (Blueprint $table): void {
            $table->dropColumn('icon_svg');
        });
    }
};
