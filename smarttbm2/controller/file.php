<?php
$dir = "C:/wamp/www/smarttbm2/SQL/";
$array = [];
// Open a directory, and read its contents
if (is_dir($dir)){
  	if ($dh = opendir($dir)){
    	while (($file = readdir($dh)) !== false){
      	//echo "filename:" . $file . "<br>";
	  	array_push($array,$file);
    	}
    	$array = json_encode($array);
		print_r($array);
    	closedir($dh);
		return $array;
  	}
}
?>