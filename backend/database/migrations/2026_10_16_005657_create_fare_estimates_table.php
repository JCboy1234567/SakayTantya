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
        Schema::create('fare_estimates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained('vehicle')->onDelete('cascade');
            $table->foreignId('fare_rules_id')->constrained('fare_rules')->onDelete('cascade');
            $table->string('pickup_name');
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->string('destination_name');
            $table->decimal('destination_latitude', 10, 8);
            $table->decimal('destination_longitude', 11, 8);
            $table->decimal('distance_km', 8, 2);
            $table->decimal('base_fare_snapshot', 8, 2);
            $table->decimal('distance_charge', 8, 2);
            $table->decimal('adjustment_amount', 8, 2);
            $table->decimal('estimated_fare', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fare_estimates');
    }
};
