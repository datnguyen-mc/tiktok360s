<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_active'        => 'boolean',
        'in_menu'          => 'boolean',
        'sources'          => 'array',
        'require_keywords' => 'array',
        'exclude_keywords' => 'array',
        'fetched_at'       => 'datetime',
    ];

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true)->orderBy('sort')->orderBy('name');
    }

    public function url(): string
    {
        return url("/category/{$this->slug}");
    }
}
