<?php

namespace App\Modules\Reviews\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Review extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'fullname',
        'review',
        'star',
        'avatar',
        'user_type',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fullname' => 'array',
            'review'   => 'array',
            'star'     => 'integer',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }
}
