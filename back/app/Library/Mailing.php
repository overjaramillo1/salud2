<?php

namespace App\Library;

use View;
use Mail;
use DB;

use App\User;

class Mailing 
{
    /**
     *  General function to send an email, this validates the default mail method
     * 
     * @param  string $name
     * @param  string $email
     * @param  string $subject
     * @param  string $content
     * @return boolean
     */
    public static function sendMail($name, $email, $subject, $content)
    {
        $mailMethod = env('MAIL_METHOD');

        if('php' == $mailMethod)
        {
            Mailing::sendPhpMail($name, $email, $subject, $content);
        }

        return true;
    }

    /**
     * This functions sends the email through PHP mail() Function
     * 
     * @param  string $name
     * @param  string $email
     * @param  string $subject
     * @param  string $content
     * @return [type]
     */
    public static function sendPhpMail($name, $email, $subject, $content)
    {
        $to = $email;

        // $data = [
        //     'name' => $name,
        //     'html_message' => $content
        // ];

        $view = View::make('emails.default')->with('name', $name)
                                            ->with('html_message', $content);

        $message = $view->render();

        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

        // More headers
        $headers .= 'From: <soporte@cinnco.co>' . "\r\n";
        $headers .= 'Cc: soporte@cinnco.co' . "\r\n";

        mail($to, $subject, $message, $headers);
    }   
}
