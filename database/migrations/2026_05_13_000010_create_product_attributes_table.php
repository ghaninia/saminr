<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_attributes', function (Blueprint $table): void {
            $table->id();
            $table->string('key');
            $table->json('label');
            $table->enum('value_type', ['text', 'number', 'select', 'color'])->default('select');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique('key');
        });

        Schema::create('product_attribute_product', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_attribute_id')->constrained('product_attributes')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['product_id', 'product_attribute_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attribute_product');
        Schema::dropIfExists('product_attributes');
    }
};
