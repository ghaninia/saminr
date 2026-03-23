<?php

namespace App\Modules\Newsletter\Models;

use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'fullname',
        'email',
    ];
}

