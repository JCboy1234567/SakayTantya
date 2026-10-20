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
        Schema::create('service_availabilities', function (Blueprint $table) {
            $table->id();
            $table->string('service_name'); // e.g. "Tagum City Tricycle Route Estimator"
            $table->string('route_zone'); // e.g. "Zone 1 - Central Business District"
            $table->string('status'); // e.g. "Operational", "Maintenance", "Suspended"
            $table->string('peak_hours')->nullable(); // e.g. "07:00 AM - 09:00 AM"
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_availabilities');
    }
};
