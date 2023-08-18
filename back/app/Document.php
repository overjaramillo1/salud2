<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    /**
     * Return the user url image
     * @return string
     */
    public function urlFile()
    {
        $url = '';

        if('' != $this->filename)
        {
            $url = ENV('API_URL') . ENV('DOCUMENTS_FOLDER') . $this->filename;
        }

        return $url;
    }
}
