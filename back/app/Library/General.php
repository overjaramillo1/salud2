<?php

namespace App\Library;

use Excel;
use View;
use Mail;
use DB;

use App\User;

class General 
{
	/**
	 * @return string
	 */
	public static function tokenGenerate() 
    {
        //Create new file name
        $characters = 'ABCDEFHJKLMNPQRTUWXYZABCDEFHJKLMNPQRTUWXYZ1234567890';
        $unique = substr(str_shuffle($characters), 0, 20);
        //return Hash::make($unique);
        return $unique;
    }

    /**
     * Generates an unique file name
     * @param  string $extension
     * @return string
     */
    public static function fileName($extension = '') 
    {
        //Create new file name
        $characters = 'ABCDEFHJKLMNPQRTUWXYZABCDEFHJKLMNPQRTUWXYZ';
        $unique = substr(str_shuffle($characters), 0, 10);
        $epoch = date('YmdHis');
        $fileName = $unique . '_' . $epoch . '.' . $extension;
        return $fileName;
    }

    public static function export($type, $title, $identifiers, $headers, $data)
    {
        if('pdf' == $type)
        {
            $data = array(
                'title' => $title,
                'identifiers' => $identifiers,
                'headers' => $headers,
                'data' => $data
            );

            $name = 'export'.date('YmdHis').'.pdf';
            $path = $_SERVER['DOCUMENT_ROOT'].'/storage/exports/'.$name;

            \PDF::loadView('exports.exportPDF', $data)
                ->setOptions(array('margin-right'  => 0,
                             'margin-bottom' => 0,
                             'margin-left'   => 0,
                             'margin-top' => 0))
                    ->setOrientation('Portrait')                  
                    ->save($path);

            return asset('storage/exports') . '/' . $name;
        }
        elseif('excel' == $type)
        {
            $name = 'export'.date('YmdHis');

            Excel::create($name, function($excel) use ($data, $title, $identifiers, $headers) {
                $excel->sheet($title, function($sheet) use ($data, $identifiers, $headers)
                {
                    $arrayRow = $headers;
                    $sheet->row(1, $arrayRow);

                    $fila = 2;
                    if(count($data) > 0)
                    {    
                        foreach ($data as $row)
                        {   
                            $arrayRow = [];
                            foreach ($identifiers as $key => $value) 
                            {
                                $arrayRow[] = $row->$value;
                            }

                            $sheet->row($fila += 1, $arrayRow);
                        }
                    }
                });
            })->save('xlsx', public_path('storage/exports'));

            return asset('storage/exports') . '/' . $name.'.xlsx';
        }   
    }
}