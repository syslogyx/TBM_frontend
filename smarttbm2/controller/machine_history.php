<?php

    $type = $_GET['type'];

    $cid = ($_GET["id"]);

    function getMachineDetailsById($cid){
          $url = 'http://localhost:8089/smarttbm_new/api/client/machine/'.$cid;
		//$url = 'http://172.16.1.110:8089/smarttbm_new/api/client/machine/'.$cid;
        // $url = 'http://smarttbm2.local:8080/api/client/machine/'.$cid;
       // $url = 'http://172.16.1.157:8085/smarttbm_new/api/client/machine/'.$cid;
        $ch = curl_init($url);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
        $output = curl_exec($ch);
        curl_close($ch);
        return json_decode($output);
    }


    if($type == 'pdf'){
        require_once('../resources/plugins/mpdf/vendor/autoload.php');

    $mpdf = new mPDF();

    // Write some HTML code:

            $datas= getMachineDetailsById($cid);
            /*function changeColor(){
                life_exhausted_till_date, alert_at_count, multiplying_factor, final_life
                if (life_exhausted_till_date < (alert_at_count * multiplying_factor)) {
                         = "green";
                    } else if (life_exhausted_till_date >= final_life) {
                        "red";
                    } else {
                        "orange";
                    }
                    return $scope.color;
            }
            */
    ob_start();

?>  

    <h3 class="box-title" style="color: orange;font-weight: bold; text-align: center"> <?php  echo $datas->response->machine_name ?>'s Machine Report</h3>
    <label class="box-title" style="font-weight: bold; text-align: center"><h4 class="box-title">Machine Details</h4></label>    
    <label style="font-weight: bold;">Department:</label> 
        <span>  <?php  echo $datas->response->department ?> </span>     <br>
    <label style="font-weight: bold;">Machine Name:</label> 
        <span>  <?php  echo $datas->response->machine_name ?> </span>  <br>
    <label style="font-weight: bold;">Button Press Count:</label> 
        <span>  <?php echo $datas->response->current_count ?> </span> <br>
    <label style="font-weight: bold;">Status:</label> 
        <span>  <?php echo $datas->response->status ?> </span>              
    
    <label class="box-title" style="font-weight: bold; text-align: center">
     <h4 class="box-title">Parts Details</h4></label>
    <table class="table table-bordered" >
        <thead>
            <tr style="background-color: #ccc;">
                <th style='text-align:center;width:10%;'>Sr. No.</th>
                <th style='text-align:center;width:20%;'>Spare Part Name</th>
                <th style='text-align:center;width:20%;'>Defined Life</th>
                <th style='text-align:center;width:20%;'>Final Life</th>
                <th style='text-align:center;width:40%;'>Life Exhausted Till Date</th>
                <th style='text-align:center;width:20%;'>Remaining Life</th>
                <th style='text-align:center;width:20%;'>Replace Count</th>
            </tr>
        </thead>
        <tbody>
            <?php

                $count=count($datas->response->parts);
                for($j=0; $j < $count; $j++)
                    {

                    $remaining = (((
                                $datas->response->parts[$j]->final_life - $datas->response->parts[$j]->life_exhausted_till_date
                                    )/$datas->response->parts[$j]->final_life)*100);
                    $r = sprintf( '%.2f', $remaining );

                ?>
            <tr>
                <td style='text-align:center; width:10%;'><?php echo $j+1 ?></td>
                <td style='text-align:center; width:20%;'><?php echo $datas->response->parts[$j]->spare_part_name ?></td>
                <td style='text-align:center; width:20%;'><?php echo $datas->response->parts[$j]->life ?></td>
                <td style='text-align:center; width:20%;'><?php echo $datas->response->parts[$j]->final_life ?></td>
                <td style='text-align:center; width:40%;'><?php echo $datas->response->parts[$j]->life_exhausted_till_date ?></td>
                <td style='text-align:center; width:20%;'><?php echo $r."%"?></td>
                <td style='text-align:center; width:20%;'><?php echo $datas->response->parts[$j]->part_replace_count ?></td>
            </tr>    
            <?php }?>               
                    
        </tbody>
    </table>
   
<?php

    $html = ob_get_clean();
    $mpdf->SetDisplayMode(125);
    $mpdf->WriteHTML($html);

    // Output a PDF file directly to the browser
    $file_storage_path = '../resources/docs/pdf/machine_history/';
    $filename = "machine_history".time();
    $ext = ".pdf";
    $mpdf->Output($file_storage_path.$filename.$ext,'F');

    $response = [
        "status"=> "success",
        "filenameLoc"=>"http://smarttbm2.local/resources/docs/pdf/machine_history/".$filename.$ext ,
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

    $datas= getMachineDetailsById($cid);

    $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

    $objPHPExcel->getActiveSheet()->SetCellValue('A1', 'Department');
    $objPHPExcel->getActiveSheet()->SetCellValue('B1', 'Machine Name');
    $objPHPExcel->getActiveSheet()->SetCellValue('C1', 'Button Press Count');
    $objPHPExcel->getActiveSheet()->SetCellValue('D1', 'Status');
    $objPHPExcel->getActiveSheet()->getStyle(1)->getFont()->setBold(true);
    $objPHPExcel->getActiveSheet()->SetCellValue('A2', $datas->response->department);
    $objPHPExcel->getActiveSheet()->SetCellValue('B2', $datas->response->machine_name);
    $objPHPExcel->getActiveSheet()->SetCellValue('C2', $datas->response->current_count);
    $objPHPExcel->getActiveSheet()->SetCellValue('D2', $datas->response->status);

    $customTitle = array ('Sr. No.','Spare Part Name','Defined Life','Final Life','Life Exhausted Till Date','Remaining Life','Replace Count');
    $cell_name = 4;
    $objPHPExcel->getActiveSheet()->SetCellValue('A4', $customTitle[0]);
    $objPHPExcel->getActiveSheet()->SetCellValue('B4', $customTitle[1]);
    $objPHPExcel->getActiveSheet()->SetCellValue('C4', $customTitle[2]);
    $objPHPExcel->getActiveSheet()->SetCellValue('D4', $customTitle[3]);

    $objPHPExcel->getActiveSheet()->SetCellValue('E4', $customTitle[4]);
    $objPHPExcel->getActiveSheet()->SetCellValue('F4', $customTitle[5]);
    $objPHPExcel->getActiveSheet()->SetCellValue('G4', $customTitle[6]);

    $objPHPExcel->getActiveSheet()->getStyle($cell_name)->getFont()->setBold(true);
    
        $objPHPExcel->getActiveSheet()->getColumnDimension('A')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('B')->setWidth('18');
        $objPHPExcel->getActiveSheet()->getColumnDimension('C')->setWidth('20');
        $objPHPExcel->getActiveSheet()->getColumnDimension('D')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('E')->setWidth('23');
        $objPHPExcel->getActiveSheet()->getColumnDimension('F')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('G')->setWidth('20');
        $objPHPExcel->getActiveSheet()->getColumnDimension('H')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('I')->setWidth('15');
        $objPHPExcel->getActiveSheet()->getColumnDimension('J')->setWidth('15');

    $count = count($datas->response->parts);

    $count = $count+4;

        for($i=5; $i <= $count; $i++ ){
     
            $index = $i-5;
            $remaining = ((($datas->response->parts[$index]->final_life - $datas->response->parts[$index]->life_exhausted_till_date)/$datas->response->parts[$index]->final_life)*100);
            $rem = sprintf( '%.2f', $remaining );

            $srno = $index+1;

            $objPHPExcel->getActiveSheet()->SetCellValue('A'.$i, $srno);
            $objPHPExcel->getActiveSheet()->SetCellValue('B'.$i, $datas->response->parts[$index]->spare_part_name );
            $objPHPExcel->getActiveSheet()->SetCellValue('C'.$i, $datas->response->parts[$index]->life );
            $objPHPExcel->getActiveSheet()->SetCellValue('D'.$i, $datas->response->parts[$index]->final_life);
            $objPHPExcel->getActiveSheet()->SetCellValue('E'.$i, $datas->response->parts[$index]->life_exhausted_till_date);
            $objPHPExcel->getActiveSheet()->SetCellValue('F'.$i, $rem.'%');
            $objPHPExcel->getActiveSheet()->SetCellValue('G'.$i, $datas->response->parts[$index]->part_replace_count);
            $srno--;
        }


        $objWriter = new PHPExcel_Writer_Excel2007($objPHPExcel);

        $file_storage_path = '../resources/docs/excel/machine_history/';
        $filename = "machine_history".time();
        $ext = ".xlsx";
        //$objWriter->save(str_replace('.php', '.xlsx', __FILE__));
        $objWriter->save($file_storage_path.$filename.$ext,__FILE__);
        $response = [
        "status"=> "success",
        "filenameLoc"=>"http://smarttbm2.local/resources/docs/excel/machine_history/".$filename.$ext ,
        "filename"=>$filename.$ext,
        ];
        
        die(json_encode($response));
}