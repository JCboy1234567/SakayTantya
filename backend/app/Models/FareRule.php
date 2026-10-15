<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FareRule extends Model
{
    protected $table = 'fare_rules';

    protected $fillable = [
        'vehicle_id',
        'base_fare',
        'included_distance_km',
        'rate_per_km',
        'minimum_fare',
        'valid_from',
        'valid_until',
        'source_reference',
    ];

    protected function casts(): array
    {
        return [
            'base_fare' => 'decimal:2',
            'included_distance_km' => 'decimal:2',
            'rate_per_km' => 'decimal:2',
            'minimum_fare' => 'decimal:2',
            'valid_from' => 'date',
            'valid_until' => 'date',
        ];
    }
}
