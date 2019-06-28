<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>SmartTBM</title>
        <!-- Tell the browser to be responsive to screen width -->
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <style>
            [ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-    ng-cloak {
                display: none !important;
            }
            .Blink {
                animation: blinker 1.5s cubic-bezier(.5, 0, 1, 1) infinite alternate;  
            }
            @keyframes blinker {  
                from { opacity: 1; }
                to { opacity: 0; }
            }
        </style>
        <style>
            .hasError{
                color: red;
                font-style: italic;
                text-align: center;
                font-weight: bold;
            }
        </style>
        <!-- Bootstrap 3.3.6 -->
        <link rel="stylesheet" href="/resources/css/bootstrap.min.css">
        <!-- Font Awesome -->
        <link rel="stylesheet" href="/resources/lib/font-awesome-4.5.0/css/font-awesome.min.css">
        <!-- Ionicons -->
        <link rel="stylesheet" href="/resources/lib/ionicons-1.5.2/css/ionicons.min.css">
        <!-- Theme style -->
        <link rel="stylesheet" href="/resources/css/AdminLTE.min.css">
        <!-- AdminLTE Skins. Choose a skin from the css/skins
             folder instead of downloading all of them to reduce the load. -->
        <link rel="stylesheet" href="/resources/css/skins/_all-skins.min.css">
        <!-- iCheck -->
        <link rel="stylesheet" href="/resources/plugins/iCheck/flat/blue.css">
        <!-- Morris chart -->
        <link rel="stylesheet" href="/resources/plugins/morris/morris.css">
        <!-- jvectormap -->
        <link rel="stylesheet" href="/resources/plugins/jvectormap/jquery-jvectormap-1.2.2.css">
        <!-- Date Picker -->
        <link rel="stylesheet" href="/resources/plugins/datepicker/datepicker3.css">
        <!-- Daterange picker -->
        <link rel="stylesheet" href="/resources/plugins/daterangepicker/daterangepicker.css">
        <link rel="stylesheet" href="/resources/bower_components/toastr/toastr.min.css">


        <link rel="stylesheet" href="/resources/css/style.css">
        <link rel="stylesheet" href="/resources/lib/angular-toggle-switch-master/angular-toggle-switch.css">
        <link rel="stylesheet" href="/resources/lib/angular-toggle-switch-master/angular-toggle-switch-bootstrap.css">
        <link rel="stylesheet" href="/resources/lib/angular-block-ui-master/dist/angular-block-ui.min.css"/>

        <!-- jQuery 2.2.3 -->
        <script src="/resources/plugins/jQuery/jquery-2.2.3.min.js"></script>
        <!-- jQuery UI 1.11.4 -->
        <script src="/resources/plugins/jQueryUI/jquery-ui.min.js"></script>

        <!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
        <!-- <script src="/resources/js/jquery.table2excel"></script>
        <script src="/resources/js/jquery.table2excel.min.js"></script> -->
        <!-- include jQuery -->
        <!-- <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js"></script> -->
        <!-- include BlockUI -->
        <!-- <script src="/resources/lib/blockui-master/jquery.blockUI.js"></script> -->

        <base href="/">
        <script src="/resources/lib/angular-1.4.8/angular.min.js"></script>
        <script src="/resources/lib/angular-1.4.8/angular-route.js"></script>
        <script src="/resources/lib/angular-toggle-switch-master/angular-toggle-switch.js">
        </script>
        <!-- After AngularJS -->
        <script src="/resources/lib/angular-block-ui-master/dist/angular-block-ui.min.js"></script>
        <script src="/resources/lib/bower-angular-touch-master/angular-touch.js"></script>
        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->
    </head>


    <body ng-app="myApp" id="indexBody" class="hold-transition skin-blue sidebar-mini ng-cloak" style="padding-right:0px !important" ng-cloak>

        <!-- <div class="preload-page-wrapper" style="display:none;text-align: center;margin-top:250px;">
          <img src="resources/img/loader.gif">
        </div> -->
        <div id="loading" style="display:none;">
            <img id="loading-image" src="resources/img/loader.gif" alt="Loading..." />
        </div>
        <!--<div class="overlay-screen"></div>-->
        <div class="wrapper">

            <header class="main-header">
                <!-- Logo -->
                <a href="/" class="logo">
                    <!-- mini logo for sidebar mini 50x50 pixels -->
                    <span class="logo-mini"><b>S</b>TBM</span>
                    <!-- logo for regular state and mobile devices -->
                    <span class="logo-lg"><b>Smart</b><span style="color: orange;font-weight: bold;">TBM</span></span>
                </a>

                <!-- Header Navbar: style can be found in header.less -->
                <nav class="navbar navbar-static-top">
                    <a href="http://www.syslogyx.com/" target="_blank">
                        <!-- mini logo for sidebar mini 50x50 pixels -->
                        <!--<span class="logo-mini"><b>S</b>TBM</span>-->
                        <!-- logo for regular state and mobile devices -->
                        <span class="logo-lg"><img src="resources/img/syslogyx_logo.png" style="padding-top: 0.5%; padding-left: 1.5%;"></span>
                    </a>
                    <!-- Sidebar toggle button-->
                    <!--                    <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">
                                            <span class="sr-only">Toggle navigation</span>
                                            <span class="icon-bar"></span>
                                            <span class="icon-bar"></span>
                                            <span class="icon-bar"></span>
                                        </a>-->

                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav" ng-controller="menuCtrl">
                            <!-- Notifications: style can be found in dropdown.less -->
                            <li class="dropdown notifications-menu" ng-controller="alertCtrl">
                                <a href="/machine/statuslist" class="dropdown-toggle" ng-click="reset()" data-toggle="dropdown" style="padding-bottom: 20px;" >
                                    <i class="fa fa-bell-o"></i>
                                    <span class="label label-warning" ng-bind="data.count > 0 ? data.count : ''"></span>
                                </a>
                            </li>
                            <!-- User Account: style can be found in dropdown.less -->
                            <li  class="dropdown user user-menu" ng-show="canAccess()">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" style="pointer-events: none;">
                                    <!--<img src="resources/img/user2-160x160.jpg" class="user-image" alt="User Image">-->
                                    <i class="fa fa-user fa-fw"></i>
                                    <span class="hidden-xs" id="userInfo" ng-model="userInfo">{{userInfo| uppercase}} </span>
                                </a>                               
                            </li>
                            <li  class="dropdown user user-menu" ng-hide="canAccess()">
                                <a href="" class="dropdown-toggle" data-toggle="dropdown" onclick="showLoginModal()">
                                    <!--<img src="resources/img/user2-160x160.jpg" class="user-image" alt="User Image">-->
                                    <i class="fa fa-sign-in fa-fw"></i>
                                    <span class="hidden-xs">Log In</span>
                                </a>                               
                            </li>
                            <!-- Control Sidebar Toggle Button -->
                            <li id="settings" ng-show="canAccess()">
                                <a href="" class="dropdown-toggle" data-toggle="dropdown" style="padding-bottom: 20px;" ><i class="fa fa-gears"></i></a>
                                <ul class="dropdown-menu">
                                    <!-- <li>
                                        <a  href=""><i class="fa fa-cog fa-fw"></i>Manage departments</a>
                                    </li> -->
                                    <li>
                                        <a onclick="showChangePasswordModal()" href=""><i class="fa fa-key fa-fw"></i>Change password</a>
                                    </li>
                                    <li>
                                        <a onclick="showConfigureSenderEmailModal()" href=""><i class="fa fa-cog fa-fw"></i>Configure Sender Email</a>
                                    </li>
                                    <li>
                                        <a href=""  ng-click="backUpDatabase($event)"><i class="fa fa-cloud-download"></i>Backup</a>
                                    </li>
                                    <li>
                                        <a href="" ng-click = "restore()"><i class="fa  fa-cloud-upload"></i>Restore</a>
                                    </li>
                                    <li>
                                        <a  href="" ng-click="logout()"><i class="fa fa-sign-out fa-fw"></i>Logout</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>

            <!-- =============================================== -->


            <!-- =============================================== -->

            <!-- Content Wrapper. Contains page content -->
            <!-- <div class="content-wrapper">  -->

            <div class="" >
                <div data-ng-view></div>            
            </div>

            <!-- /.control-sidebar -->
            <!-- Add the sidebar's background. This div must be placed
                 immediately after the control sidebar -->
            <div class="control-sidebar-bg"></div>

        </div>
        <div class="row">
            <div style="position: fixed;bottom: 0px;margin-left: 10px;right: 15px;"><i class="fa fa-desktop" id="internetIcon" style="font-size:48px;"></i></div>
        </div>

        <!-- Log In modal -->
        <div class="modal fade default-modal "  id="login-modal" role="dialog" ng-controller="loginCtrl">
            <div class="modal-dialog modal-sm" >
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">x</span>
                        </button>
                        <center><h4 class="modal-title"><a href="#"><b>Smart<span style="color: orange">TBM</span></b></a></h4></center>
                    </div>
                    <div class="text-center" id="errorSectionForLogin" style="display: none; color:red;">
                        <span class="control-label" for="inputError"><i class="fa fa-times-circle-o"></i> Invalid Username or Password</span>
                    </div>
                    <div class="modal-body" style="word-wrap: break-word;">
                        <p class="text-center"><b>Sign In</b></p>
                        <form method="post" id="login-form">
                            <div id="usernameSection" class="form-group has-feedback">
                                <input id="username" name="username" ng-model="username" type="text" class="form-control" value="" placeholder="Username" required="" autofocus> 
                                <span class="glyphicon form-control-feedback"></span>
                            </div>
                            <div id="passwordSection" class="form-group has-feedback">
                                <input id="password" name="password" type="password" ng-model="password" class="form-control" value="" placeholder="Password" required=""> 
                                <span class="glyphicon form-control-feedback"></span>
                            </div>
                            <div class="row">
                                <div class="col-xs-4" style="float: right;">
                                    <button ng-click="submit()" class="btn btn-primary btn-block btn-flat" >Sign In</button>
                                </div>
                                <!-- /.col -->
                            </div>
                        </form>    
                    </div>
                </div>
            </div>
        </div>

        <!-- Change password modal -->
        <div class="modal fade default-modal"  id="changePasswordModal" role="dialog" ng-controller="changePasswordCtrl">
            <div class="modal-dialog modal-md" >
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">x</span>
                        </button>
                        <center><h4 class="modal-title"><a href="#"><b><span style="color: orange">Change Password</span></b></a></h4></center>
                    </div>
                    <div class="text-center" id="errorSectionForChangePassword" style="display: none; color:red;">
                        <span class="control-label" for="inputError"><i class="fa fa-times-circle-o"></i> </span>
                    </div>
                    <div class="modal-body" style="word-wrap: break-word;">
                        <!--  <p class="text-center"><b>Sign In</b></p> -->
                        <form  method="post" id="changePasswordForm">
                            <div class="form-group has-feedback">
                                <label class="control-label" for="inputError"> Username</label>
                                <input type="text" class="form-control" ng-model="username" id="username" name="username" value="{{userInfo| uppercase}}" disabled>
                                <span class="glyphicon form-control-feedback"></span>
                            </div>
                            <div class="form-group has-feedback">
                                <label class="control-label" for="inputError"> Old Password</label>
                                <input type="password" onkeypress='return RestrictSpace()' ng-model="oldPassword" class="form-control" id="oldpassword" name="oldpassword" placeholder="Enter old password" required>
                                <span class="glyphicon form-control-feedback"></span>
                            </div>
                            <div class="form-group has-feedback">
                                <label class="control-label" for="inputError"> New Password</label>
                                <input type="password" onkeypress='return RestrictSpace()' class="form-control" id="newpassword" name="newpassword"  placeholder="Enter new password" ng-model="newPassword" required>
                                <span class="glyphicon form-control-feedback"></span>
                            </div>
                            <div class="form-group has-feedback">
                                <label class="control-label" for="inputError"> Confirm New Password</label>
                                <input type="password" onkeypress='return RestrictSpace()' class="form-control" id="confirmpassword" name="confirmpassword"  placeholder="Confirm new password" ng-model="confirmPassword" required>
                                <span class="glyphicon form-control-feedback"></span>
                            </div>
                            <div class="modal-footer" style="border-top-color: #eee; text-align:center">
                                <button type="button" class="btn btn-default" data-dismiss="modal">&nbsp;Close&nbsp;</button>
                                <button ng-click="submitPassword()" onclick="" class="btn btn-primary btn-flat">Save</button>
                            </div>
                        </form>    
                    </div>
                </div>
            </div>
        </div>

        <!-- Configure Sender email -->
        <div class="modal fade default-modal"  id="configureSenderEmailModal" role="dialog" ng-controller="configureSenderEmailCtrl">
            <div class="modal-dialog modal-md" >
                <!--  <div block-ui="myBlockUI" id="loading" style="display:none;">
                               <img id="loading-image" src="resources/img/loader.gif" alt="Loading..." />
                             </div> -->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">x</span></button>
                        <center><h4 class="modal-title"><a href="#"><b><span style="color: orange">Configure Sender Email</span></b></a></h4></center>
                    </div>
                    <div class="text-center" id="errorSectionForconfigureSenderEmail" style="display: none; color:red;">
                        <span class="control-label" for="inputError"><i class="fa fa-times-circle-o"></i> </span>
                    </div>
                    <div class="modal-body" style="word-wrap: break-word;">
                        <div class="row">
                            <form class="ng-pristine ng-valid ng-valid-email" id="configureSenderEmailForm">
                                <div class="col-md-6">
                                    <fieldset class="emailConf">                       
                                        <legend class="emailConf">Email Configure</legend>
                                        <div class="form-group has-feedback">
                                            <label class="control-label" for="inputError">Host Name</label>
                                            <input type="text" class="form-control " ng-model="emailDtls.host" id="host" name="host" placeholder="Enter Host Name" ng-focus="disableSaveButton()" value="{{emailDtls.host}}">
                                            <span class="glyphicon form-control-feedback"></span>
                                        </div>
                                        <div class="form-group has-feedback">
                                            <label class="control-label" for="inputError">Port</label>
                                            <input type="text" class="form-control  number ng-pristine ng-untouched ng-valid" id="port" name="port" ng-model="emailDtls.port" value="{{emailDtls.port}}" placeholder="Enter Port Number" maxlength="4" ng-focus="disableSaveButton()">
                                            <span class="glyphicon form-control-feedback"></span>
                                        </div>
                                        <div class="form-group has-feedback">
                                            <label class="control-label" for="inputError">Email id</label>
                                            <input type="email" class="form-control email ng-pristine ng-untouched ng-valid ng-valid-email" id="senderEmail_id" name="senderEmail_id" value="{{emailDtls.email}}" placeholder="Enter email address" ng-model="emailDtls.email" ng-focus="disableSaveButton()" >
                                            <span class="glyphicon form-control-feedback"></span>
                                        </div>
                                        <div class="form-group has-feedback">
                                            <label class="control-label" for="inputError">Email Password</label>
                                            <input type="password" class="form-control ng-pristine ng-untouched ng-valid" id="senderPassword" name="senderPassword" placeholder="Enter password" ng-model="emailDtls.email_pwd" value="{{emailDtls.email_pwd}}" ng-focus="disableSaveButton()" required>
                                            <span class="glyphicon form-control-feedback"></span>
                                        </div>
                                        <div style="text-align:center">
                                            <button id="submitEmailConfiguration" type="submit" ng-click="submitEmailConfiguration($event)" class="btn btn-primary btn-flat" disabled="">&nbsp;Save&nbsp;</button>
                                        </div>
                                    </fieldset>
                                </div>
                                <div class="col-md-6">
                                    <fieldset class="emailConf">
                                        <legend class="emailConf">Test Configured Mail</legend>
                                        <div class="form-group has-feedback">
                                            <label class="control-label" for="inputError"> Email To</label>
                                            <input  type="email" class="form-control ng-pristine ng-untouched ng-valid ng-valid-email email distinctnames" ng-model="mail_to" id="mail_to" placeholder="Enter email address" name="mail_to" value="">
                                            <span class="glyphicon form-control-feedback"></span>
                                        </div>
                                        <div class="form-group has-feedback">
                                            <label class="control-label" for="inputError">Message</label>
                                            <textarea id="mail_body" name="mail_body" ng-model="mail_body" class="form-control ng-pristine ng-untouched ng-valid" rows="6" placeholder="Enter Message"></textarea>
                                            <span class="glyphicon form-control-feedback"></span>
                                        </div>
                                        <div class="modal-footer" style="text-align:center">
                                            <button type="button" class="btn btn-primary btn-flat" ng-click="sendTestMail($event)">Test Configurations</button>
                                        </div>
                                    </fieldset>   
                                </div>
                                <div class="col-sm-12">
                                    <fieldset class="emailConf">
                                        <legend class="emailConf">Note</legend>
                                        <div class="form-group has-feedback">
                                            <span>
                                                If you are going to use gmail Id then TURN ON "Access for less secure apps" from below link <a href="https://www.google.com/settings/security/lesssecureapps">"https://www.google.com/settings/security/lesssecureapps"</a><br>First login to your gmail using above credentials then click above link
                                            </span>
                                        </div>
                                    </fieldset>
                                </div>
                            </form>
                        </div>    
                    </div>
                </div>
            </div>
        </div>

        <!-- Select file modal -->
        <div class="modal fade default-modal"  id="list" role="dialog" ng-controller="menuCtrl" >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">x</span>
                        </button>
                        <center><h4 class="modal-title"><a href="#"><b><span style="color: orange">Choose File to Restore</span></b></a></h4></center>
                    </div>
                    <div class="modal-body" style="word-wrap: break-word;">
                        <form name="myForm">
                            <ul style="height:auto; overflow-y:scroll;max-height: 300px;">
                                <li ng-repeat="option in listOfSQLFiles.list">
                                    <input name="lsit" type="radio" ng-model='$parent.fileName' ng-value='"{{option}}"'>
                                    {{option}}
                                </li>
                            </ul>  
                            <!-- <input type="file" accept=".sql" ng-modal="fileName"/><br> -->
                            <input type="submit" ng-click="submit()" value="Submit"/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <!-- ./wrapper -->

        <script>
            $.widget.bridge('uibutton', $.ui.button);

        </script>
        <!-- Bootstrap 3.3.6 -->
        <script src="/resources/js/bootstrap.min.js"></script>
        <!-- Morris.js charts -->
        <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script> -->
        <script src="/resources/plugins/morris/morris.min.js"></script>
        <!-- Sparkline -->
        <script src="/resources/plugins/sparkline/jquery.sparkline.min.js"></script>
        <!-- jvectormap -->
        <script src="/resources/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js"></script>
        <script src="/resources/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script>
        <!-- jQuery Knob Chart -->
        <script src="/resources/plugins/knob/jquery.knob.js"></script>
        <!-- daterangepicker -->
        <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js"></script> -->
        <!-- <script src="/resources/plugins/daterangepicker/daterangepicker.js"></script> -->
        <!-- datepicker -->
        <script src="/resources/plugins/datepicker/bootstrap-datepicker.js"></script>

        <!-- Slimscroll -->
        <script src="/resources/plugins/slimScroll/jquery.slimscroll.min.js"></script>
        <!-- FastClick -->
        <script src="/resources/plugins/fastclick/fastclick.js"></script>
        <script src="/resources/bower_components/jquery-validation/dist/jquery.validate.min.js"></script>
        <script src="/resources/bower_components/jquery-validation/dist/additional-methods.min.js"></script>
        <script src="/resources/bower_components/toastr/toastr.min.js"></script>
        <!--jQuery Cookies -->
        <script src="/resources/bower_components/jquery-cookie-master/src/jquery.cookie.js"></script>
        <script src="/resources/plugins/bootbox/bootbox.min.js"></script>
        <!-- AdminLTE App -->
        <script src="/resources/js/app.min.js"></script>
        <!--AdminLTE dashboard demo (This is only for demo purposes)--> 
       <!--<script src="/resources/js/pages/dashboard.js"></script>-->
        <!-- AdminLTE for demo purposes -->
        <script src="/resources/js/demo.js"></script>
        <script src="/resources/js/myapp.js"></script>
        <script src="/resources/js/validation.js"></script>
        <!-- <script src="/resources/js/myapp1.js"></script> -->
        <script type="text/javascript">
            validateChangePasswordForm();
            validateConfigureSenderEmailForm();
        </script>
        <script>

            function doConnectFunction() {
                internetStatus = '<h4 class="box-title" style="color: green;font-weight: bold;text-align: center;">Internet connection is available in the network.</h4>';
                $('#internetStatus').html(internetStatus);
                $('#internetIcon').css('color', 'green');
                $('#internetIcon').removeClass('Blink');
            }
            function doNotConnectFunction() {
                internetStatus = "<h4 class='box-title' style='color: red;font-weight: bold;text-align: center;'>There is no internet connection on this network, so you won't receive notification alert over emails.</h4>";
                $('#internetStatus').html(internetStatus);
                $('#internetIcon').css('color', 'red');
                $('#internetIcon').addClass('Blink');

            }
            setInterval(function () {
                var i = new Image();
                i.onload = doConnectFunction;
                i.onerror = doNotConnectFunction;
                // console.log("i am here");
                // CHANGE IMAGE URL TO ANY IMAGE YOU KNOW IS LIVE
                i.src = 'http://gfx2.hotmail.com/mail/uxp/w4/m4/pr014/h/s7.png?d=' + escape(Date());
            }, 100);

        </script>
    </body>
</html>