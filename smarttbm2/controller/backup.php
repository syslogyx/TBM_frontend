<?php

$user = "smart_tbm";
$pass = "smart_tbm";
$host = "localhost";
$db = "smart_tbm";
date_default_timezone_set("Asia/Kolkata");
$backup_file = 'C:\wamp\www\smarttbm2\SQL\DB_'.$db . date("Y-m-d-H-i-s") . '.sql';

//backup
$command = 'C:\wamp\bin\mysql\mysql5.5.24\bin\mysqldump --opt -u '.$user.' -p'.$pass.' '.$db.' > '.$backup_file.' 2>&1';


//restore
//$command = 'c:\wamp\bin\mysql\mysql5.6.17\bin\mysql -u '.$user.' -p'.$pass.' '.$db.' < c:\wamp\www\sql\test34.sql ';

 
 print_r($command);
 
$output = shell_exec($command);