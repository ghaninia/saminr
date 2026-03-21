<?php

namespace App\Modules\Uploads\Media;

use App\Modules\Settings\Models\Setting;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

class UploadsPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        $base = 'uploads/';

        $model = $media->model;
        if ($model instanceof Setting && ! empty($model->key)) {
            return $base.'settings/'.$this->sanitize($model->key).'/';
        }

        $type = class_basename($media->model_type);
        $type = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $type) ?: 'model');

        return $base.$type.'/'.$media->model_id.'/';
    }

    public function getPathForConversions(Media $media): string
    {
        return $this->getPath($media).'conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->getPath($media).'responsive-images/';
    }

    private function sanitize(string $value): string
    {
        $value = strtolower($value);
        $value = preg_replace('/[^a-z0-9._-]+/i', '-', $value) ?: 'setting';
        $value = trim($value, '-');

        return $value === '' ? 'setting' : $value;
    }
}

