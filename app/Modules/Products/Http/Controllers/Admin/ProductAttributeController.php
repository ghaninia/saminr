<?php

namespace App\Modules\Products\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\ProductAttribute;
use Illuminate\Http\JsonResponse;

class ProductAttributeController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ProductAttribute::query()
            ->with('values')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (ProductAttribute $attribute): array => [
                'id' => $attribute->id,
                'key' => $attribute->key,
                'label' => $attribute->label,
                'value_type' => $attribute->value_type,
                'sort_order' => $attribute->sort_order,
                'values' => $attribute->values->map(fn ($value): array => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'meta' => $value->meta,
                    'sort_order' => $value->sort_order,
                ])->values(),
            ])
            ->values();

        return response()->json([
            'data' => $items,
        ]);
    }
}
