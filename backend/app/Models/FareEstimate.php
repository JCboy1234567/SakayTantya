<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FareEstimate extends Model
{
    protected $table = 'fare_estimates';

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'fare_rules_id',
        'pickup_name',
        'pickup_latitude',
        'pickup_longitude',
        'destination_name',
        'destination_latitude',
        'destination_longitude',
        'distance_km',
        'base_fare_snapshot',
        'distance_charge',
        'adjustment_amount',
        'estimated_fare',
    ];

    protected function casts(): array
    {
        return [
            'pickup_latitude' => 'decimal:8',
            'pickup_longitude' => 'decimal:8',
            'destination_latitude' => 'decimal:8',
            'destination_longitude' => 'decimal:8',
            'distance_km' => 'decimal:2',
            'base_fare_snapshot' => 'decimal:2',
            'distance_charge' => 'decimal:2',
            'adjustment_amount' => 'decimal:2',
            'estimated_fare' => 'decimal:2',
        ];
    }
}
