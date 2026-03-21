<?php

namespace App\Modules\Categories\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Categories\Http\Resources\CategoryResource;
use App\Modules\Categories\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()->orderByDesc('id')->get()
        );
    }

    public function store(Request $request): CategoryResource
    {
        $validated = $this->validatePayload($request);

        $category = Category::query()->create($validated);

        return new CategoryResource($category);
    }

    public function update(Request $request, Category $category): CategoryResource
    {
        $validated = $this->validatePayload($request, $category->id);

        $category->fill($validated)->save();

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'message' => 'Deleted.',
        ]);
    }

    public function upload(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:4096', 'mimes:png,jpg,jpeg,webp,svg,ico'],
            'field' => ['sometimes', 'string', Rule::in(['image', 'icon'])],
        ], [
            'file.required' => 'A file is required.',
            'file.mimes' => 'Only png, jpg, jpeg, webp, svg, and ico files are allowed.',
            'file.max' => 'Maximum file size is 4MB.',
            'field.in' => 'Field must be either image or icon.',
        ]);

        $field = $validated['field'] ?? 'image';

        $media = $category
            ->addMediaFromRequest('file')
            ->toMediaCollection($field);

        $url = $media->getUrl();

        $category->update([$field => $url]);

        return response()->json([
            'url' => $url,
            'category' => (new CategoryResource($category->fresh()))->resolve(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request, ?int $ignoreId = null): array
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'array'],
            'subtitle' => ['required', 'array'],
            'content' => ['nullable', 'array'],
            'color' => ['nullable', 'string'],
            'icon' => ['nullable', 'string'],
            'short_link' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'short_link')->ignore($ignoreId),
            ],
            'image' => ['nullable', 'string'],
        ], [
            'title.required' => 'Title is required.',
            'subtitle.required' => 'Subtitle is required.',
            'short_link.required' => 'Short link is required.',
        ]);

        $validator->after(function ($validator) use ($request): void {
            $this->validateLocalizedObject($validator, 'title', $request->input('title'));
            $this->validateLocalizedObject($validator, 'subtitle', $request->input('subtitle'));

            $content = $request->input('content');
            if ($content !== null) {
                $this->validateLocalizedObject($validator, 'content', $content);
            }
        });

        /** @var array<string, mixed> $validated */
        $validated = $validator->validate();

        // Normalize empty arrays to include fa/en keys.
        foreach (['title', 'subtitle', 'content'] as $key) {
            if (! array_key_exists($key, $validated)) {
                continue;
            }
            if ($validated[$key] === null) {
                continue;
            }
            if (! is_array($validated[$key])) {
                continue;
            }
            $validated[$key] = [
                'fa' => (string) Arr::get($validated[$key], 'fa', ''),
                'en' => (string) Arr::get($validated[$key], 'en', ''),
            ];
        }

        return $validated;
    }

    /**
     * @param array<string, mixed>|mixed $value
     */
    private function validateLocalizedObject(mixed $validator, string $path, mixed $value): void
    {
        if (! is_array($value) || ! Arr::isAssoc($value)) {
            $validator->errors()->add($path, 'Value must be an object with {fa,en}.');
            return;
        }

        if (! array_key_exists('fa', $value) || ! array_key_exists('en', $value)) {
            $validator->errors()->add($path, 'Both fa and en fields are required.');
            return;
        }

        if (! is_string($value['fa']) || ! is_string($value['en'])) {
            $validator->errors()->add($path, 'Both fa and en must be strings.');
        }
    }
}

