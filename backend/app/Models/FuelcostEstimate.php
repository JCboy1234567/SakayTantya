<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelcostEstimate extends Model
{
    protected $table = 'fuel_cost_estimates';

    protected $fillable = [
        'fare_estimates_id',
        'fuel_prices_id',
        'price_per_liter_snapshot',
        'fuel_efficiency_snapshot',
        'estimated_liters',
        'estimated_fuel_cost',
    ];

    protected function casts(): array
    {
        return [
            'price_per_liter_snapshot' => 'decimal:2',
            'fuel_efficiency_snapshot' => 'decimal:2',
            'estimated_liters' => 'decimal:2',
            'estimated_fuel_cost' => 'decimal:2',
        ];
    }
}
