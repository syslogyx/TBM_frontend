<?php

$file = $_GET['name'];

$user = "smart_tbm";
$pass = "smart_tbm";
$host = "localhost";
$db = "smart_tbm";
$path = "c:\wamp\www\smarttbm2\SQL\'";
$path = rtrim($path,"'");
$path=$path.$file;

//backup
//$command = 'c:\wamp\bin\mysql\mysql5.6.17\bin\mysqldump --opt -u '.$user.' -p'.$pass.' '.$db.' > test.sql 2>&1';


//restore
//$command = 'c:\wamp\bin\mysql\mysql5.5.24\bin\mysql -u '.$user.' -p'.$pass.' '.$db.' < c:\wamp\www\smarttbm2\SQL\DB_smart_tbm2017-02-15-10-29-25.sql ';
$command = 'c:\wamp\bin\mysql\mysql5.5.24\bin\mysql -u '.$user.' -p'.$pass.' '.$db.' < '.$path;

 
 print_r($command);
 
$output = shell_exec($command);