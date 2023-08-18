<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Auth;

class PermissionsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($role_id)
    {
        try 
        {
            $permissions = Permission::all();
            $role = Role::find($role_id);

            if(count($permissions) > 0)
            {
                foreach ($permissions as $permission) 
                {
                    if('es' == Auth::user()->language)
                    {
                        $permission->permission_name = $this->permissionsEs[$permission->name][0];
                        $permission->section = $this->permissionsEs[$permission->name][1];
                        $permission->section_name = $this->permissionsEs[$permission->name][2];
                    }
                    else
                    {
                        $permission->permission_name = $this->permissionsEn[$permission->name][0];
                        $permission->section = $this->permissionsEn[$permission->name][1];
                        $permission->section_name = $this->permissionsEn[$permission->name][2];
                    }

                    if($role->hasPermissionTo($permission->name))
                    {
                        $permission->allowed = true;
                    }
                    else
                    {
                        $permission->allowed = false;   
                    }
                }
            }

            $this->_response = $permissions;
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
        try 
        {
            $id = $request->input('id');
            $permission = null;

            if($id != 0)
            {
                $permission = Permission::find($id);
            }

            if(null == $permission)
            {
                $permission = Permission::create(['name' => $request->input('name')]);

                $this->_response = ['message' => trans('permissions.permission_created')];
            }
            else
            {
                $permission->name = $request->input('name');
                $permission->save();

                $this->_response = ['message' => trans('permissions.permission_updated')];
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

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
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
        //
    }

    /**
     * Give permission to role.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function permissionToRole(Request $request)
    {
        try 
        {
            $permission_id = $request->input('permission_id');
            $role_id = $request->input('role_id');
            
            $permission = Permission::find($permission_id);
            $role = Role::find($role_id);

            if(null == $permission || null == $role)
            {
                return response()->json([], self::STATUS_NOT_FOUND);
            }

            $role->givePermissionTo($permission);

            $this->_response = ['message' => trans('permissions.associated_permission')];
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
     * Revoke permission to role.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function revokePermissionTo(Request $request)
    {
        try 
        {
            $permission_id = $request->input('permission_id');
            $role_id = $request->input('role_id');
            
            $permission = Permission::find($permission_id);
            $role = Role::find($role_id);

            if(null == $permission || null == $role)
            {
                return response()->json([], self::STATUS_NOT_FOUND);
            }

            $role->revokePermissionTo($permission);

            $this->_response = ['message' => trans('permissions.revoked_permission')];
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
     * Function that allows to async all permissions of a role
     * @param  Request $request [description]
     * @return [type]           [description]
     */
    public function syncPermissions(Request $request)
    {
        try 
        {
            $role_id = $request->input('role_id');
            $permissionsText = $request->input('permissions');
            
            $role = Role::find($role_id);
            $permissions = explode(',', $permissionsText);

            if(null == $role)
            {
                return response()->json([], self::STATUS_NOT_FOUND);
            }

            $role->syncPermissions($permissions);

            $this->_response = ['message' => trans('permissions.synchronized_permissions')];
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
