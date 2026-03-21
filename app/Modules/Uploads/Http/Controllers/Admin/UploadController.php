<?php

namespace App\Modules\Uploads\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:4096', 'mimes:png,jpg,jpeg,webp,svg,ico'],
        ], [
            'file.required' => 'A file is required.',
            'file.mimes' => 'Only png, jpg, jpeg, webp, svg, and ico files are allowed.',
            'file.max' => 'Maximum file size is 4MB.',
        ]);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $validated['file'];

        $directory = 'uploads/dashboard/'.now()->format('Y/m');
        $filename = Str::random(32).'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs($directory, $filename, 'public');

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}

