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
        Schema::table('testing_feedbacks', function (Blueprint $table) {
            if (!Schema::hasColumn('testing_feedbacks', 'vehicle_plate')) {
                $table->string('vehicle_plate')->nullable()->after('module_tested');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testing_feedbacks', function (Blueprint $table) {
            $table->dropColumn('vehicle_plate');
        });
    }
};
