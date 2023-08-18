<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Library\General;
use App\Document;
use Validator;
use Config;
use Auth;
use Hash;
use DB;

class DocumentsController extends Controller
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

            $documents = Document::where('title', 'like', '%'.$search.'%')
                                 ->orWhere('original_name', 'like', '%'.$search.'%')
                                 ->paginate($rows);

            if(count($documents) > 0)
            {
                foreach ($documents as $document) 
                {
                    $document->url_file = $document->urlFile();
                }
            }

            $this->_response = $documents;
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

        if($id == 0)
        {
            $validator = Validator::make($request->all(), [
                'title' => 'required',
                'file' => 'required'
            ]);

            if ($validator->fails()) 
            {
                $errors = $validator->errors();
                return response()->json(['success' => false, 'message' => $errors->all()]);
            }
        }

        try 
        {
            $message = trans('messages.updated_document');

            $document = Document::find($id);

            if(null == $document)
            {
                $message = trans('messages.created_document');
                $document = new Document;
            }

            $fileName = '';
            $originalName = '';
            if (\Request::hasFile('file')) 
            {
                $file = \Request::file('file');
                $settings = Config::get('filesconfig.documents');
                $fileExtension = strtolower($file->getClientOriginalExtension());
                $originalName = $file->getClientOriginalName();
                $fileName = General::fileName($fileExtension);
                $path = $settings['files'] . $fileName;
                \Storage::disk('local')->put($path, \File::get($file));

                if($document->filename != '')
                {
                    if (\Storage::exists($settings['files'] . $document->filename)) 
                    {
                        \Storage::delete($settings['files'] . $document->filename);
                    }
                }
            }

            if('' != $request->input('title'))
            {
                $document->title = $request->input('title');
            }

            if('' != $originalName)
            {
                $document->original_name = $originalName;
            }

            if('' != $fileName)
            {
                $document->filename = $fileName;
            }   

            if(false === $document->save())
            {
                return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
            }

            $document->url_file = $document->urlFile();

            $this->_response = ['success' => true, 'message' => $message, 'document' => $document];
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
        // try 
        // {
            
        // } 
        // catch (Exception $e) 
        // {
        //     //Write error in log
        //     Log::error($e->getMessage() . ' line: ' . $e->getLine() . ' file: ' . $e->getFile());
        //     return response()->json([], self::STATUS_INTERNAL_SERVER_ERROR);
        // }

        // return response()->json($this->_response, self::STATUS_OK);
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
            $document = Document::find($id);
            $settings = Config::get('filesconfig.documents');

            if($document->filename != '')
            {
                if (\Storage::exists($settings['files'] . $document->filename)) 
                {
                    \Storage::delete($settings['files'] . $document->filename);
                }
            }

            if(false === $document->delete())
            {
                $this->_response = ['success' => false, 'message' => trans('messages.unexpected_error')];
            }
            else
            {
                $this->_response = ['success' => true, 'message' => trans('messages.deleted_document')];
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
