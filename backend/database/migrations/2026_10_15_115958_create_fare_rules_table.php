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
        Schema::create('fare_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicle')->onDelete('cascade');
            $table->decimal('base_fare', 8, 2);
            $table->decimal('included_distance_km', 8, 2);
            $table->decimal('rate_per_km', 8, 2);
            $table->decimal('minimum_fare', 8, 2);
            $table->date('valid_from');
            $table->date('valid_until')->nullable();
            $table->string('source_reference')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fare_rules');
    }
};
