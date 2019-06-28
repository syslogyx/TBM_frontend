<?php
    
    $type = $_GET['type'];
    $len = ($_GET['len']);
    // print_r($len);
    $sr = ($_GET['count']);
    // print_r($len);
    // die();
    $cid = ($_GET["id"]);

    function getPartHistoryById($cid){
        $url = 'http://localhost:8089/smarttbm_new/api/client/machine/history/'.$cid;
        // $url = 'http://localhost:8080/api/client/machine/history/'.$cid;
		// $url = 'http://172.16.1.110:8089/smarttbm_new/api/client/machine/history/'.$cid;
        // $url = 'http://smarttbm2.local:8080/api/client/machine/history/'.$cid;
       // $url = 'http://172.16.1.157:8085/smarttbm_new/api/client/machine/history/'.$cid;
        $ch = curl_init($url);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
        $output = curl_exec($ch);
        curl_close($ch);
        return json_decode($output);
    }

    //check type of file
    if($type == 'pdf'){
        require_once('../resources/plugins/mpdf/vendor/autoload.php');

        $mpdf = new mPDF();

        $datas= getPartHistoryById($cid);

        ob_start();

?>  

    <h3 class="box-title" style="color: orange;font-weight: bold; text-align: center"> View machines part history</h3>
    <div class="box-header with-border bg-gray">
         <h4 class="box-title">Machine & it's Part Details</h4>
    </div>
    <div class="box-body">
                    <div class="row">
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="departments">Department:</label>
                                <span><?php echo $datas->response->department ?></span>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="machineName">Machine Name:</label>
                                <span><?php echo $datas->response->machine_name ?>
                                </span>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="dcdLinkedIp">DCD Linked IP:</label>
                                <span><?php echo $datas->response->dcd_linked_ip ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="partName">Part Name:</label>
                                <span><?php echo $datas->response->parts[0]->spare_part_name ?>
                                </span>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="btnPressCount">Button Press Count:</label>
                                <span><?php echo $datas->response->current_count ?>
                                </span>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="status">Status:</label>
                                <span><?php echo $datas->response->status ?>
                                </span>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="definedLife">Defined Life:</label>
                                <span><?php                                 
                                echo $datas->response->parts[0]->life_extended == false ? $datas->response->parts[0]->life :($datas->response->parts[0]->life + $datas->response->parts[0]->life_exten_limit) ?>
                                    
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="row">                        
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="balancedLife">Balanced Life:</label>
                                <span><?php                                 
                                echo $datas->response->parts[0]->final_life - $datas->response->parts[0]->life_exhausted_till_date ?>
                                </span>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="form-group">
                                <label class="control-label" for="srNo">Sr. No.:</label>
                                <span><?php        
                                $srno = $sr.'/'.$len;                 
                                echo $srno ?> 
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
   
     <label class="box-title" style="font-weight: bold; text-align: center">
     <h4 class="box-title">Parts Details</h4></label>
    <table class="table table-bordered">
        <thead>
            <tr style="background-color: #ccc;">
                <th style='text-align:center;'>Sr. No.</th>
                <th style='text-align:center;'>Date</th>
                <th style='text-align:center;'>Count</th>
                <th style='text-align:center;'>Activity Details</th>
            </tr>
        </thead>
        <tbody>
        <?php 
            $count=count($datas->response->part_history);
            for($j=0; $j < $count; $j++){        
        ?>
        <tr>           
            <td style='text-align:center;width:50%;'><?php echo $j+1 ?></td>
            <td style='text-align:center;width:50%;'><?php 
            $date = $datas->response->part_history[$j]->added_on;
            $dateTime = explode(".",$date);
            echo $dateTime[0] ?></td>
            <td style='text-align:center;width:20%;'><?php echo $datas->response->part_history[$j]->life_exhausted_till_date ?></td>
            <td style='text-align:center;width:70%;'><?php echo $datas->response->part_history[$j]->activity_details ?></td>
        </tr>
        <?php }?>  
        </tbody>
    </table>
   
<?php

    $html = ob_get_clean();

    $mpdf->WriteHTML($html);
    $mpdf->SetDisplayMode(100);
    // Output a PDF file directly to the browser
    $file_storage_path = '../resources/docs/pdf/parts_history/';
    $filename = "machine_part_history".time();
    $ext = ".pdf";
        $mpdf->Output($file_storage_path.$filename.$ext,'F');
    $response = [
        "status"=> "success",
        "filenameLoc"=>"http://smarttbm2.local/resources/docs/pdf/parts_history/".$filename.$ext ,
        "filename"=>$filename.$ext,
    ];

    die(json_encode($response));
}

    if($type == 'excel'){
        require_once('../resources/plugins/phpexcel/classes/PHPExcel.php');
        require_once('../resources/plugins/phpexcel/classes/PHPExcel/Writer/Excel2007.php');
        $objPHPExcel = new PHPExcel();

        $objPHPExcel->getProperties()->setCreator("Maarten Balliauw");
        $objPHPExcel->getProperties()->setLastModifiedBy("Maarten Balliauw");
        $objPHPExcel->getProperties()->setTitle("Office 2007 XLSX Test Document");
        $objPHPExcel->getProperties()->setSubject("Office 2007 XLSX Test Document");
        $objPHPExcel->getProperties()->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.");

        $objPHPExcel->setActiveSheetIndex(0);

        $datas = getPartHistoryById($cid);

        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

        $Title = array ('Department','Machine Name','DCD Linked IP','Part Name','Button Press Count','Status','Defined Life','Balanced Life','Sr. No.');

        $objPHPExcel->getActiveSheet()->SetCellValue('A1', $Title[0]);
        $objPHPExcel->getActiveSheet()->SetCellValue('B1', $Title[1]);
        $objPHPExcel->getActiveSheet()->SetCellValue('C1', $Title[2]);
        $objPHPExcel->getActiveSheet()->SetCellValue('D1', $Title[3]);
        $objPHPExcel->getActiveSheet()->SetCellValue('E1', $Title[4]);
        $objPHPExcel->getActiveSheet()->SetCellValue('F1', $Title[5]);
        $objPHPExcel->getActiveSheet()->SetCellValue('G1', $Title[6]);
        $objPHPExcel->getActiveSheet()->SetCellValue('H1', $Title[7]);
        $objPHPExcel->getActiveSheet()->SetCellValue('I1', $Title[8]);

        $objPHPExcel->getActiveSheet()->getStyle(1)->getFont()->setBold(true);

        $objPHPExcel->getActiveSheet()->SetCellValue('A2', $datas->response->department );
        $objPHPExcel->getActiveSheet()->SetCellValue('B2', $datas->response->machine_name );
        $objPHPExcel->getActiveSheet()->SetCellValue('C2', $datas->response->dcd_linked_ip);
        $objPHPExcel->getActiveSheet()->SetCellValue('D2', $datas->response->parts[0]->spare_part_name);
        $objPHPExcel->getActiveSheet()->SetCellValue('E2', $datas->response->current_count);
        $objPHPExcel->getActiveSheet()->SetCellValue('F2', $datas->response->status);
        $defended_life = $datas->response->parts[0]->life_extended == false ? $datas->response->parts[0]->life :($datas->response->parts[0]->life + $datas->response->parts[0]->life_exten_limit);
        $balancedLife = $datas->response->parts[0]->final_life - $datas->response->parts[0]->life_exhausted_till_date;
        $objPHPExcel->getActiveSheet()->SetCellValue('G2', $defended_life);

        $objPHPExcel->getActiveSheet()->SetCellValue('H2', $balancedLife);

        $srno = $sr.'/'.$len;

        $objPHPExcel->getActiveSheet()->SetCellValue('I2', $srno);

        $customTitle = array ('Date','Count','Activity Details');
        $cell_name = 4;
        $objPHPExcel->getActiveSheet()->SetCellValue('A4', $customTitle[0]);
        $objPHPExcel->getActiveSheet()->SetCellValue('B4', $customTitle[1]);
        $objPHPExcel->getActiveSheet()->SetCellValue('C4', $customTitle[2]);

        $objPHPExcel->getActiveSheet()->getStyle($cell_name)->getFont()->setBold(true);

        $objPHPExcel->getActiveSheet()->getColumnDimension('A')->setWidth('20');
        $objPHPExcel->getActiveSheet()->getColumnDimension('B')->setWidth('20');
        $objPHPExcel->getActiveSheet()->getColumnDimension('C')->setWidth('35');
        $objPHPExcel->getActiveSheet()->getColumnDimension('D')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('E')->setWidth('35');
        $objPHPExcel->getActiveSheet()->getColumnDimension('F')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('G')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('H')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('I')->setWidth('15');

        $count = count($datas->response->part_history);
      
        $count = $count+4;

        for($i=5; $i <= $count; $i++ ){
 
            $index = $i-5;
                $srno = $index+1;

                $objPHPExcel->getActiveSheet()->SetCellValue('A'.$i, $srno );
                $date = $datas->response->part_history[$index]->added_on;
                $dateTime = explode(".", $date);
                $objPHPExcel->getActiveSheet()->SetCellValue('A'.$i, $dateTime[0]);
                $objPHPExcel->getActiveSheet()->SetCellValue('B'.$i, $datas->response->part_history[$index]->life_exhausted_till_date );
                $objPHPExcel->getActiveSheet()->SetCellValue('C'.$i, $datas->response->part_history[$index]->activity_details);
                $srno--;
        }

        $objWriter = new PHPExcel_Writer_Excel2007($objPHPExcel);
        $file_storage_path = '../resources/docs/excel/parts_history/';
        $filename = "machine_history".time();
        $ext = ".xlsx";
        //$objWriter->save(str_replace('.php', '.xlsx', __FILE__));
        $objWriter->save($file_storage_path.$filename.$ext,__FILE__);
        $response = [
        "status"=> "success",
        "filenameLoc"=>"http://smarttbm2.local/resources/docs/excel/parts_history/".$filename.$ext ,
        "filename"=>$filename.$ext,
        ];
        die(json_encode($response));
}