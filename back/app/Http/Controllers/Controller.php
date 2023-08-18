<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Auth;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * 2xx - Success
     * 3xx - Redirection
     * 4xx - Client error
     * 5xx - Server Error
     */
    
    //HTTP status codes
    const STATUS_OK = 200;
    const STATUS_CREATED = 201;
    const STATUS_NO_CONTENT = 204;
    const STATUS_NOT_MODIFIED = 304;
    const STATUS_BAD_REQUEST = 400;
    const STATUS_UNAUTHORIZED = 401;
    const STATUS_PAYMENT_REQUIRED = 402;
    const STATUS_FORBIDDEN = 403;
    const STATUS_NOT_FOUND = 404;
    const STATUS_UNPROCESSABLE_ENTITY = 422;
    const STATUS_INTERNAL_SERVER_ERROR = 500;
    const STATUS_NOT_IMPLEMENTED = 501;
    
    //Response for all api calls
    protected $_response = [];

    protected $permissionsEs = [
                                "index_users" => ["Listar usuarios", "users", "Usuarios"],
                                "create_users" => ["Crear usuarios", "users", "Usuarios"],
                                "update_users" => ["Actualizar usuarios", "users", "Usuarios"],
                                "delete_users" => ["Eliminar usuarios", "users", "Usuarios"]
                             ];

    protected $permissionsEn = [
                                "index_users" => ["List users", "users", "Users"],
                                "create_users" => ["Create users", "users", "Users"],
                                "update_users" => ["Update users", "users", "Users"],
                                "delete_users" => ["Delete users", "users", "Users"]
                             ];

    public function __construct()
    {
        if(!Auth::check()) abort(403, 'Unauthorized');

        $this->user = Auth::user();
        //app('translator')->setLocale($this->user->language_code); // 'en', 'ro', etc
    }

    /**
     * Rewrite validation structure for api
     * 
     * @param  Validator $validator
     * @return json
     */
    protected function formatValidationErrors(Validator $validator)
    {
        $keys = $validator->errors()->keys();
        $messages = $validator->errors()->all();

        $json = [];
        $json['status'] = 422;
        $json['attributes'] = $keys;
        $json['messages'] = $messages;

        return $json;
    }
}
