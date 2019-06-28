<?php 
// $server_api = "http://172.16.1.110:8089/smarttbm_new/api/dcd";
 //$server_api = "http://localhost:8080/api/dcd";
$server_api = "http://localhost:8089/smarttbm_new/api/dcd";
// $server_api = "http://172.16.1.91:8088/smarttbm_new/api/dcd";
function doHandshakeWithApi ($dcd_ip){
  global $server_api;
  $dcd_ip = array('dcd_linked_ip' => $dcd_ip);
  $ch = curl_init($server_api.'/handshake');
  curl_setopt_array($ch, array(
    CURLOPT_POST => TRUE,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => array(
         'Content-Type: application/json'
    ),
    CURLOPT_POSTFIELDS => json_encode($dcd_ip),
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_PROXY => false
  ));

  // Send the request
  $response = curl_exec($ch);

  // Check for errors
  if($response === FALSE){
      die(curl_error($ch));
  }
 
  // Decode the response
  $responseData = json_decode($response, TRUE);
  return $responseData;
}

function sendCycleInfo($message){
  global $server_api;
  $message = array('cycle_info' => $message);
  $ch = curl_init($server_api.'/cycleinfo');
  curl_setopt_array($ch, array(
    CURLOPT_POST => TRUE,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => array(
         'Content-Type: application/json'
    ),
    CURLOPT_POSTFIELDS => json_encode($message),
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_PROXY => false
  ));

  // Send the request
  $response = curl_exec($ch);
  // print_r(json_decode($response));
  // Check for errors
  // if($response === FALSE){
  //     die(curl_error($ch));
  // }
 
  // Decode the response
  //print_r($response);
  $responseData = json_decode($response, TRUE);

  return $responseData;
}

?>

