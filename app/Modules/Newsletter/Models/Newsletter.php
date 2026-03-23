<?php

namespace App\Modules\Newsletter\Models;

use Illuminate\Database\Eloquent\Model;

class Newsletter extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'subject',
        'html',
        'status',
        'queued_at',
        'sent_at',
        'sent_count',
        'last_error',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'queued_at' => 'datetime',
        'sent_at' => 'datetime',
        'sent_count' => 'integer',
    ];
}

