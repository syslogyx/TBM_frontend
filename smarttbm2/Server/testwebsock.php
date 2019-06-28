#!/usr/bin/env php
<?php
require_once('./websockets.php');
require_once('./machine_server_controller.php');

$clients = array();
$server_ip = "172.16.1.91";
$enableLog = FALSE;

class echoServer extends WebSocketServer {
    //protected $maxBufferSize = 1048576; //1MB... overkill for an echo server, but potentially plausible for other applications.

    /**
     * RECIEVER CALLBACK FROM clients 
     * 
      CURRENT_COUNT=1,
      MACHINE_STATUS=ON,
      ALERT=OFF,
      MACHINE_ID=50,
      OLD=NULL,
      TIME=1480482668



     * */
    protected function processAdminSignal($user, $message) {
        global $clients;
        global $server_ip;

//        print_r("\nmessage form smarttbm2 to DB is >>>>");
//        print_r($message);
        $this->stdout("\n>>message form smarttbm2 to DB is: >>>> " . $message ."\n");
        if ($message != null) {
            $message = explode(",CMD=", $message);
            $messageForCycleInfo = $message[0];
            $msg = explode(",", $message[1]);
            $cmd = $msg[0];
            $ip = explode("=", $msg[1]);
            $ip = $ip[1];

            $data = sendCycleInfo($messageForCycleInfo);

//            print_r("response data of processAdminSignal from DB is >>>>");
//            print_r($data);

            if ($data != null) {
                $responseData = explode(",", $data["response"]);
                if ($responseData[4] == "CMD=NULL") {
                    $responseData[4] = "CMD=" . $cmd;
                    $command = implode(",", $responseData);
                }
//                print_r("\nCommand to send DCD is >>>");
//                print_r($command);
                $this->stdout("\n>>Command to send DCD is: >>>>" . $command ."\n");
            } else {
                echo 'Data not found';
            }

            if (!empty($clients)) {
                foreach ($clients as $userKey => $users) {
                    $user_origin = $users->headers['origin'];
                    $user_origin = explode('//', $user_origin);

                    if ($user_origin[1] == "localhost" && $ip == $server_ip) {
                        $user_origin[1] = $server_ip;
                    }

                    if ($user_origin[1] == $ip) {
                        $this->send($users, $command);
                    } else {
                        
                    }
                }
            } else {
                echo 'Client not found';
            }
        } else {
            echo 'Message not found';
        }
    }

    /**
     * RECIEVER CALLBACK FROM clients 
     * */
    protected function process($user, $message) {
        global $clients;
        global $server_ip;
        global $enableLog;

        $this->stdout("\n>>msg from DCD IS: >>>>" . $message ."\n");

        if (strpos($message, ',') !== false) {
            $data = sendCycleInfo($message);
//            print_r("response data of process from DB is >>>>");
//            print_r($data);
            if ($data != null) {

                if ($data["response"] == "" || $data["response"] == null) {
                    $command = $data['msg'];
                } else {
                    $command = $data['response'];
                }

                $this->send($user, $command);
            } else {
                echo 'Data Not Found';
            }

            $msg = explode(",", $message);
            $current_count = explode("=", $msg[0]);
            $old =  explode("=", $msg[4]);
            $user_ip = $user->headers['origin'];
            $user_ip = explode('//', $user_ip);

            if ($current_count[1] == 0 || $old[1] == "STRT" || $old[1] == "STOP" || $old[1] == "EXTD" || $old[1] == "REST" || $old[1] == "RPLC") {
                foreach ($clients as $userKey => $users) {
                    $user_origin = $users->headers['origin'];
                    $user_origin = explode('//', $user_origin);
                    if (($key = array_search($user, $clients)) !== false) {
                        if ($user_origin[1] == "smarttbm2.local") {
                            $this->send($users, $message);
                            return;
                        } else {
                            
                        }
                    }
                }
            }

            if ($enableLog) {
                $mID = explode("=", $msg[3]);
                $log = new CreateLogging();

                $file_storage_path = '../logs/';
                $filename = "logFile_" . $mID[1] . "_" . date("j.n.Y") . ".txt";
                $fname = $file_storage_path . $filename;
                // set path and name of log file (optional)
                $log->lfile($fname);
                // write message to the log file
                $log->lwrite($message);
                // close log file
                $log->lclose();
            }
        } else {
            echo 'Message is not in correct Format';
            $this->closed($user);
        }
    }

    /**
     * * HANDSHAKE CALLBACK
     * */
    protected function connected($user) {
        global $clients;
        global $server_ip;
        $handshakeIP = null;

        print_r("\n connected called \n");

        $user_origin = $user->headers['origin'];
        $user_origin = explode('//', $user_origin);

        if ($user_origin[1] == 'localhost') {
            $user_host = $user->headers['host'];
            $user_host = explode(':', $user_host);
            $handshakeIP = $user_host[0];
        } else {
            $handshakeIP = $user_origin[1];
        }

        if ($handshakeIP == "smarttbm2.local") {
            
        } else {
            $data = doHandshakeWithApi($handshakeIP);
//            print_r("response data of connected From DB is >>>>");
//            print_r($data['response']);
            if ($data != null) {
                $command = $data['response'];
//                print_r("\nConnected data to send DCD is >>>>");
//                print_r($command);
                $this->stdout("\n>>Connected Command to send DCD is: >>>>" . $command ."\n");
                $this->send($user, $command);
            } else {
                echo 'Data Not Found';
            }
        }

        if (!empty($clients)) {
            foreach ($clients as $userKey => $users) {
                $user_origin = $users->headers['origin'];
                $user_origin = explode('//', $user_origin);

                if ($user_origin[1] == "localhost" && $handshakeIP == $server_ip) {
                    $handshakeIP = "localhost";
                }

                if ($user_origin[1] == $handshakeIP) {
                    unset($clients[$userKey]);
                    $clients = array_values($clients);
                }
            }
        }
        array_push($clients, $user);
        //print_r($clients);
    }

    protected function closed($user) {
        global $clients;
        // Do nothing: This is where cleanup would go, in case the user had any sort of
        // open files or other objects associated with them.  This runs after the socket 
        // has been closed, so there is no need to clean up the socket itself here.
        //$conn = $this->database_connection();
        if (($key = array_search($user, $clients)) !== false) {
            //$this->delete_data ($clients[$key],$conn);
            //print_r($clients[$key]);
            unset($clients[$key]);
            $clients = array_values($clients);
            // print_r($clients);
            echo "User closed connectionn\n";
        }
        // $message = "Connectionn closed";
        //$this->send($user, $message);
    }

}

$echo = new echoServer($server_ip, "9000");
//$echo = new echoServer("localhost","9000");

try {
    $echo->run();
} catch (Exception $e) {
    $echo->stdout($e->getMessage());
}

/**
 * Logging class:
 * - contains lfile, lwrite and lclose public methods
 * - lfile sets path and name of log file
 * - lwrite writes message to the log file (and implicitly opens log file)
 * - lclose closes log file
 * - first call of lwrite method will open log file implicitly
 * - message is written with the following format: [d/M/Y:H:i:s] (script name) message
 */
class CreateLogging {

    // declare log file and file pointer as private properties
    private $log_file, $fp;

    // set log file (path and name)
    public function lfile($path) {
        //print_r($path);
        $this->log_file = $path;
    }

    // write message to the log file
    public function lwrite($message) {
        $machineID = explode(",", $message);
        $mID = explode("=", $machineID[3]);
        //print_r($machineID);
        // if file pointer doesn't exist, then open log file
        if (!is_resource($this->fp)) {
            $this->lopen($mID);
        }
        // define script name
        // $script_name = pathinfo($_SERVER['PHP_SELF'], PATHINFO_FILENAME);
        // define current time and suppress E_WARNING if using the system TZ settings
        // (don't forget to set the INI setting date.timezone)
        $time = date('[d/M/Y H:i:s]');
        // write current time, script name and message to the log file
        //$gmtTimezone = new DateTimeZone('GMT');
        //$now = new DateTime();
        //print_r($gmtTimezone);
        //print_r($now);
        //$today = $now->format("F j, Y, g:i A" ,$gmtTimezone);
        //print_r($today);
        fwrite($this->fp, "$time $message" . PHP_EOL);
    }

    // close log file (it's always a good idea to close a file when you're done with it)
    public function lclose() {
        fclose($this->fp);
    }

    // open log file (private method)
    private function lopen($mID) {
        // in case of Windows set default log file
        /*  if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
          // $log_file_default = 'c:/php/logfile.txt';
          $log_file_default = '../logs/logfile.txt';
          } */
        // set default log file for Linux and other systems
        /* else {
          $log_file_default = '../logs/logfile.txt';
          } */
        if (!($mID[1])) {
            $log_file_machine = '../logs/machine_' . $mID[1] . 'logfile.txt';
        }
        // define log file from lfile method or use previously set default
        $lfile = $this->log_file ? $this->log_file : $log_file_machine;
        // open log file for writing only and place file pointer at the end of the file
        // (if the file does not exist, try to create it)
        $this->fp = fopen($lfile, 'a') or exit("Can't open $lfile!");
    }

}
