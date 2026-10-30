<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestingFeedbackModel extends Model
{
    use HasFactory;

    protected $table = 'testing_feedbacks';

    protected $fillable = [
        'tester_name',
        'email',
        'module_tested',
        'vehicle_plate',
        'rating',
        'feedback_comments',
        'status',
    ];
}
