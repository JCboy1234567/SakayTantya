<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Vehicle extends Model
{
    protected $table = 'vehicle';

    protected $fillable = [
        'vehicle_name',
        'fuel_type',
        'fuel_efficiency_km_per_liter',
        'image',
        'description',
        'is_active',
    ];

    protected $casts = [
        'fuel_efficiency_km_per_liter' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function getImageAttribute($value)
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL) || str_starts_with($value, 'http')) {
            return $value;
        }

        return asset('storage/' . $value);
    }
}
