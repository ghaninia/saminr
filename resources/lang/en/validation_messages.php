<?php

return [
    'file' => [
        'required' => 'A file is required.',
        'mimes' => 'Only png, jpg, jpeg, webp, svg, and ico files are allowed.',
        'max' => 'Maximum file size is 4MB.',
    ],
    'field' => [
        'in' => 'The selected field is invalid.',
    ],
    'setting_id' => [
        'required' => 'A setting_id is required.',
    ],
    'title' => [
        'required' => 'Title is required.',
    ],
    'subtitle' => [
        'required' => 'Subtitle is required.',
    ],
    'short_link' => [
        'required' => 'Short link is required.',
    ],
    'localized_object' => [
        'object' => 'Value must be an object with {fa,en}.',
        'keys' => 'Both fa and en fields are required.',
        'strings' => 'Both fa and en must be strings.',
    ],
    'value' => [
        'present' => 'The value field is required.',
        'object_or_array' => 'The value must be an object with {fa,en} or an array of {fa,en}.',
        'each_item_object' => 'Each item must be an object with {fa,en}.',
        'array' => 'The value must be an array.',
        'number' => 'The value must be a number.',
        'email' => 'The value must be a valid email address.',
        'url' => 'The value must be a valid URL.',
        'string' => 'The value must be a string.',
    ],
];
