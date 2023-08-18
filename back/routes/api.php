
<?php
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, GET, PUT, PATH, DELETE, OPTIONS');
// header('Access-Control-Allow-Headers: X-Requested-With, content-type');

if (isset($_SERVER['HTTP_ORIGIN'])) 
{
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') 
{
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}


use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function(){
    echo app('hash')->make('123456');
    return '';
});

Route::prefix('v1')->group(function () {

    Route::post('recover-password', 'Auth\PasswordController@recoverPassword');

	Route::group(['middleware' => ['api', 'lang']], function(){

		//------- Authentication routes -------//
		Route::post('signup', 'Auth\AuthController@register');
	  	Route::post('login', 'Auth\AuthController@login');
    	Route::post('logout', 'Auth\AuthController@logout');
    	Route::post('refresh', 'Auth\AuthController@refresh');
    	Route::post('me', 'Auth\AuthController@me');

    	//------- Roles routes -------//
    	Route::get('roles', 'RolesController@index');
    	Route::post('roles', 'RolesController@store');

    	//------- Permissions routes -------//
    	Route::get('permissions/{role_id}', 'PermissionsController@index');
    	Route::post('permissions', 'PermissionsController@store');
    	Route::post('permission-to-role', 'PermissionsController@permissionToRole');
        Route::post('revoke-permission-to', 'PermissionsController@revokePermissionTo');
        Route::post('sync-permissions', 'PermissionsController@syncPermissions');

    	//------- Users routes -------//
    	Route::post('role-to-user', 'UsersController@roleToUser');
        Route::post('remove-role', 'UsersController@removeRole');
        Route::get('permissions-user/{id}', 'UsersController@permissions');
        Route::get('users', 'UsersController@index');
        Route::post('users', 'UsersController@store');
        Route::get('users/{id}', 'UsersController@show');
        Route::delete('users/{id}', 'UsersController@destroy');
        Route::get('export-users', 'UsersController@export');

        //------- Profile routes -------//
        Route::post('update-profile', 'UsersController@updateProfile');

        //------- Documents routes -------//
        Route::get('documents', 'DocumentsController@index');
        Route::post('documents', 'DocumentsController@store');
        Route::delete('documents/{id}', 'DocumentsController@destroy');
	});

});

