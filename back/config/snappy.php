<?php
return array(
 'pdf' => array(
 'enabled' => true,
 'binary' => '"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"',
 //'binary' => '/usr/local/bin/wkhtmltopdf.sh',    
 'timeout' => false,
 'options' => array(),
 ),
 'image' => array(
 'enabled' => true,
 'binary' => '"C:\Program Files\wkhtmltopdf\bin\wkhtmltoimage.exe"',
//'binary' => '/usr/local/bin/wkhtmltoimage.sh', 
 'timeout' => false,
 'options' => array(),
 ),
);