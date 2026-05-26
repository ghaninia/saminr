<?php

namespace App\Modules\Contacts\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'fullname',
        'email',
        'content',
        'is_read',
        'is_answered',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
        'is_answered' => 'boolean',
    ];
}
