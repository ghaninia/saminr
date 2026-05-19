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
        Schema::create('product_variant_options', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('product_variant_id');
            $table->unsignedBigInteger('product_attribute_id');
            $table->unsignedBigInteger('product_attribute_value_id');
            $table->timestamps();

            // Use explicit short constraint names to avoid MySQL identifier length limit (64 chars)
            $table->foreign('product_variant_id', 'pvo_pv_fk')
                ->references('id')
                ->on('product_variants')
                ->cascadeOnDelete();
            $table->foreign('product_attribute_id', 'pvo_pa_fk')
                ->references('id')
                ->on('product_attributes')
                ->cascadeOnDelete();
            $table->foreign('product_attribute_value_id', 'pvo_pav_fk')
                ->references('id')
                ->on('product_attribute_values')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variant_options');
    }
};
