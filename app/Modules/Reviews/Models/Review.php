<?php

namespace App\Modules\Reviews\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

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
}
