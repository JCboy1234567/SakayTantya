<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceAvailability extends Model
{
    use HasFactory;

    protected $table = 'service_availabilities';

    protected $fillable = [
        'service_name',
        'route_zone',
        'status',
        'peak_hours',
        'remarks',
    ];
}
