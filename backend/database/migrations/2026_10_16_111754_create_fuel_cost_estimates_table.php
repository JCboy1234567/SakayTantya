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
        Schema::create('fuel_cost_estimates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fare_estimates_id')->constrained('fare_estimates')->onDelete('cascade');
            $table->foreignId('fuel_prices_id')->constrained('fuel_prices')->onDelete('cascade');
            $table->decimal('price_per_liter_snapshot', 8, 2);
            $table->decimal('fuel_efficiency_snapshot', 8, 2);
            $table->decimal('estimated_liters', 8, 2);
            $table->decimal('estimated_fuel_cost', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_cost_estimates');
    }
};
