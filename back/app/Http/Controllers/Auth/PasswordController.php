<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Library\Mailing;
use App\Library\General;
use App\User;

class PasswordController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['recoverPassword']]);
    }

    /**
     * Method to send an email to recover password
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function recoverPassword(Request $request)
	{
        try 
        {
            $email = $request->input('email');

            $user = User::where('email', $email)->first();

            if(null == $user)
            {
                return response()->json(['success' => false, 'message' => trans('auth.user_not_found')]);
            }

            $token = General::tokenGenerate();
            
            $user->remember_token = $token;
            $user->save();

            $siteUrl = ENV('SITE_URL');
            $url_activation = $siteUrl . 'reset-password/'.$token;
            $content = trans('auth.recover_message', ['link' => $url_activation]);

            //return response()->json(['success' => false, 'message' => $content]);

            $result = Mailing::sendMail($user->name, 
                                        $user->email, 
                                        trans('auth.recover_password'),
                                        $content 
                                        );

            if($result)
            {
                $this->_response = ['success' => true, 'message' => trans('auth.recovery_email_sent')];
            }
            else
            {
                $this->_response = ['success' => false, 'message' => trans('auth.email_not_sent')];   
            }
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
	}
}