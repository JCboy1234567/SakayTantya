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
        Schema::dropIfExists('locations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->decimal('latitude', 10, 6);
            $table->decimal('longitude', 10, 6);
            $table->timestamps();
        });
    }
};
