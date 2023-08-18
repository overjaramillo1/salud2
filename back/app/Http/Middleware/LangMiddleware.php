<?php 

namespace App\Http\Middleware;

use Closure;
use Auth;

class LangMiddleware {

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
    {
        if (!Auth::guest()) 
        {
            \App::setLocale(Auth::user()->language);
        }
        else
        {
        	\App::setLocale('es');	
        }
        return $next($request);
    }

}
