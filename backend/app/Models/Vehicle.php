<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'vehicle';

    protected $fillable = [
        'vehicle_name',
        'fuel_type',
        'fuel_efficiency_km_per_liter',
        'description',
        'is_active',
    ];

    protected $casts = [
        'fuel_efficiency_km_per_liter' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
