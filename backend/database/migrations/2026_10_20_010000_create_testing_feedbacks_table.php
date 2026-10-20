<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('testing_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->string('tester_name');
            $table->string('email');
            $table->string('module_tested'); // e.g. "Fare Estimator", "Fuel Price Index", "Vehicle Profiles"
            $table->enum('rating', ['Excellent', 'Good', 'Needs Improvement', 'Bug / Issue'])->default('Good');
            $table->text('feedback_comments');
            $table->string('status')->default('Pending Review'); // e.g. "Pending Review", "Resolved", "In Progress"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testing_feedbacks');
    }
};
