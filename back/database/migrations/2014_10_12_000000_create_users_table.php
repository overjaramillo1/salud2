<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('email', 150)->unique();
            $table->string('password', 100);
            $table->string('language', 10)->default('es');
            $table->string('image', 255);
            $table->tinyInteger('status')->default(0);
            $table->timestamp('last_date_connection');
            //------- Uncomment for mobile applications ---------//
            //$table->string('device_token', 255);
            //$table->string('platform', 45);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
