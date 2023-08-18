<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Library\General;
use Validator;
use App\User;
use Config;
use Auth;
use Hash;
use DB;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try 
        {
            $rows = $request->input('rows');
            $search = $request->input('search');

            $users = DB::table('v_users')
                       ->where('name', 'like', '%'.$search.'%')
                       ->orWhere('email', 'like', '%'.$search.'%')
                       ->orWhere('role_name', 'like', '%'.$search.'%')
                       ->orWhere('status_name', 'like', '%'.$search.'%')
                       ->orWhere('last_connection', 'like', '%'.$search.'%')
                       ->paginate($rows);

            $this->_response = $users;
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $id = $request->input('id');
        $emailValidation = 'unique:users';

        if(0 != $id)
        {
            $emailValidation = 'unique:users,email,' . $id;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|max:255|'.$emailValidation,
            'password' => 'required_if:id,0',
            'role_id' => 'required'
        ]);

        if ($validator->fails()) 
        {
            $errors = $validator->errors();

            return response()->json(['success' => false, 'message' => $errors->all()]);
        }

        try 
        {
            $user = User::find($id);

            if(null == $user)
            {
                $user = new User;
            }

            $user->name = $request->input('name');
            $user->email = $request->input('email');

            if('' != $request->input('password') && null != $request->input('password'))
            {
                $user->password = Hash::make($request->input('password'));
            }
            $user->status = $request->input('status');

            if(false === $user->save())
            {
                return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
            }

            //We find the role
            $role = Role::find($request->input('role_id'));
            //We verify if the user already has the role
            if(!$user->hasRole($role->name))
            {
                $user->syncRoles([$role->name]);
            }

            $message = '';
            if(0 == $id)
            {
                $message = trans('messages.created_user');
            }
            else
            {
                $message = trans('messages.updated_user');
            }
            
            $this->_response = ['success' => true, 'message' => $message];
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try 
        {
            $user = User::find($id);
            $roles = $user->getRoleNames(); // Returns a collection

            $role = null;
            if(count($roles) > 0)
            {
                $role = Role::findByName($roles[0]);
            }

            $user->role = $role;
            unset($user['roles']);

            $this->_response = $user;
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try 
        {
            $user = User::find($id);
            
            $user->syncRoles([]);

            if(false === $user->delete())
            {
                return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
            }

            $this->_response = ['success' => true, 'message' => trans('messages.deleted_user')];
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
    }

    /**
     * It assigns a role to an user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function roleToUser(Request $request)
    {
        try 
        {
            $user_id = $request->input('user_id');
            $role_id = $request->input('role_id');
            
            $user = User::find($user_id);
            $role = Role::find($role_id);

            if(null == $user || null == $role)
            {
                return response()->json([], self::STATUS_NOT_FOUND);
            }

            $user->assignRole($role->name);

            $this->_response = ['message' => trans('permissions.assigned_role')];
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
        
    }

    /**
     * Remove role to an user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function removeRole(Request $request)
    {
        try 
        {
            $user_id = $request->input('user_id');
            $role_id = $request->input('role_id');
            
            $user = User::find($user_id);
            $role = Role::find($role_id);

            if(null == $user || null == $role)
            {
                return response()->json([], self::STATUS_NOT_FOUND);
            }

            $user->removeRole($role->name);

            $this->_response = ['message' => trans('permissions.removed_role')];
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
        
    }

    /**
     * Returns the permissions of an user
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function permissions($id)
    {
        try 
        {
            $user = User::find($id);

            if(null == $user)
            {
                return response()->json([], self::STATUS_NOT_FOUND);
            }

            $permissions = $user->getAllPermissions();

            if(count($permissions) > 0)
            {
                foreach ($permissions as $permission) 
                {
                    if('es' == Auth::user()->language)
                    {
                        $permission->permission_name = $this->permissionsEs[$permission->name];
                    }
                    else
                    {
                        $permission->permission_name = $this->permissionsEn[$permission->name];
                    }
                }
            }

            $this->_response = ['permissions' => $permissions];
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
        
    }

    /**
     * Saves the changes on the user session profile
     * @param  Request $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $password = $request->input('password');

        $validator = null;

        if('' != $password)
        {
            $validator = Validator::make($request->all(), [
                'password' => 'min:6',
                'repassword' => 'min:6|same:password',
                'email' => 'max:255|unique:users,email,' . $user->id
            ]);
        }
        else
        {
            $validator = Validator::make($request->all(), [
                'email' => 'max:255|unique:users,email,' . $user->id
            ]);
        }
            

        if ($validator->fails()) 
        {
            $errors = $validator->errors();
            return response()->json(['success' => false, 'message' => $errors->all()]);
        }
        
        try 
        {
            $imageName = "";
            if (\Request::hasFile('image')) 
            {
                $imageFile = \Request::file('image');
                $settings = Config::get('filesconfig.users');
                $fileExtension = strtolower($imageFile->getClientOriginalExtension());
                $imageName = General::fileName($fileExtension);
                $path = $settings['images'] . $imageName;
                \Storage::disk('local')->put($path, \File::get($imageFile));

                if($user->image != '')
                {
                    if (\Storage::exists($settings['images'] . $user->image)) 
                    {
                        \Storage::delete($settings['images'] . $user->image);
                    }
                }
            }

            if('' != $request->input('name'))
            {
                $user->name = $request->input('name');
            }

            if('' != $request->input('email'))
            {
                $user->email = $request->input('email');
            }

            if('' != $request->input('password') && null != $request->input('password'))
            {
                $user->password = Hash::make($request->input('password'));
            }

            if('' != $imageName)
            {
                $user->image = $imageName;
            }

            if(false === $user->save())
            {
                return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
            }

            $user->url_image = $user->image();
            
            $this->_response = ['success' => true, 'user' => $user, 'message' => trans('messages.updated_profile')];
        } 
        catch (Exception $e) 
        {
            //Write error in log
            Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
            return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        }

        return response()->json($this->_response, self::STATUS_OK);
    }

    public function export(Request $request)
    {
        try 
        {
            $search = $request->input('search');
            $type = $request->input('type');

            $title = trans('forms.users_list');
            $identifiers = ['id', 'name', 'email', 'status_name', 'last_connection', 'role_name'];
            $headers = ['Id', trans('forms.name'), trans('forms.email'), trans('forms.status'), trans('forms.last_connection'), trans('forms.role')];

            $data = DB::table('v_users')
                       ->where('name', 'like', '%'.$search.'%')
                       ->orWhere('email', 'like', '%'.$search.'%')
                       ->orWhere('role_name', 'like', '%'.$search.'%')
                       ->orWhere('status_name', 'like', '%'.$search.'%')
                       ->orWhere('last_connection', 'like', '%'.$search.'%')
                       ->select('id', 'name', 'email', 'status_name', 'last_connection', 'role_name')
                       ->get();

            $url = General::export($type, $title, $identifiers, $headers, $data);

            $this->_response = $url;
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
