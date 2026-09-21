<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyStat extends Model
{
    protected $primaryKey = 'date';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'date'         => 'date',
            'by_hour'      => 'array',
            'by_device'    => 'array',
            'by_referrer'  => 'array',
            'by_category'  => 'array',
            'top_articles' => 'array',
            'rolled_at'    => 'datetime',
        ];
    }
}
