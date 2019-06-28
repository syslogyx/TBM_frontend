var app = angular.module("myApp", ["ngRoute", 'toggle-switch', 'blockUI', 'ngTouch']);
app.run(function ($rootScope) {
    $rootScope.$on('scope.stored', function (event, data) {
        console.log("scope.stored", data);
    });
});
app.constant('RESOURCES', (function () {
    // Define your variable
    var resource = 'http://127.0.0.1:8008';
    // Use the variable in your constants
    return {
        SERVER_WEB: 'http://localhost/smart_tbm/',
        ALERT_INTERVAL: 1000,
        SERVER_API: "http://172.16.1.91:8089/smarttbm_new/api/",
        //SERVER_API: "http://localhost:8080/api/",
        REFRESH_INTERVAL: 2000,
        serverSocket: null,
        serverSocketMsg: null,
        serverSocketStatus: false,
        //hostName: window.location.hostname,
        socketUrl: "ws://172.16.1.91:9000/",
    }
})());

app.service('common', function (RESOURCES, $http, $route, services) {
    this.loginPopUp = function () {
        bootbox.confirm({
            title: "Alert",
            message: "You are not authorised user.<br>Please Login to perform action .",
            buttons: {
                cancel: {
                    label: 'Cancel'
                },
                confirm: {
                    label: 'Login'
                }
            },
            backdrop: true,
            callback: function (r) {
                if (r) {
                    bootbox.hideAll();
                    showLoginModal();
                }
            }
        });
    }

    this.setAuthKey = function (authkey) {
        var date = new Date();
        var minutes = 0.5;
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        $.cookie('authKey', authkey);
    }

    this.getAuthKey = function () {
        return $.cookie('authKey');
    }

    this.hidePopup = function () {
        $(".modal").modal('hide');
    }

    this.ConfirmMessageBox = function (message, fun) {
        bootbox.confirm({
            message: message,
            onEscape: function () {
                // console.log("Escape!");
            },
            backdrop: true,
            callback: fun
        })
    }

    this.doInit = function () {
        var that = this;
        var connectServer = false;
        try {

            // if (!RESOURCES.serverSocketStatus) {
            RESOURCES.serverSocket = new WebSocket(RESOURCES.socketUrl);
            RESOURCES.serverSocket.onopen = function (e) {
                // if (!RESOURCES.serverSocketStatus) {
                toastr.success("Handshaking completed ...");
                RESOURCES.serverSocketStatus = true;
                // }
            };
            // }
            RESOURCES.serverSocket.onclose = function (e) {
                toastr.warning("connection closed.");
                if (!connectServer) {
                    connectServer = true;
                } else {
                    connectServer = false;
                }
                that.connectServerAgain(connectServer);
                // break;
            };
            RESOURCES.serverSocket.onerror = function (e) {
                toastr.error("connection error.");
                //that.connectServerAgain();
                // break;
                if (!connectServer) {
                    connectServer = true;
                } else {
                    connectServer = false;
                }
                that.connectServerAgain(connectServer);
            };
            RESOURCES.serverSocket.onmessage = function (e) {
                RESOURCES.serverSocketMsg = null;
                if (e.data == "DCD Linked IP is not connected with server.") {
                    toastr.error(e.data);
                    console.log("if>>>" + RESOURCES.serverSocketMsg)
                } else {
                    RESOURCES.serverSocketMsg = e.data;
                    console.log("else>>>" + RESOURCES.serverSocketMsg)
                    //toastr.success(e.data);
                }
            };
            if (RESOURCES.serverSocket.readyState != 1) {
                // that.connectServerAgain();
            }
        } catch (ex) {
            toastr.info("connection exception:" + ex);
        }
    }

    this.connectServerAgain = function (connectServer) {
        var that = this;
        //console.log($('.body').hasClass('.modal-open'));
        if (connectServer) {
            bootbox.alert({
                title: "Refresh",
                backdrop: true,
                buttons: {
                    ok: {
                        label: 'Refresh'
                    }
                },
                message: "Connection lost! Please handshake again to perfom this operation.</br> Click Refresh to Handshake.",
                callback: function () {
                    that.doInit();
                }
            });
        }
    }



    this.startAnimation = function () {
        if ($("#loading").css('display') == 'none') {
            $('#loading').css("display", "block");
        }
    }

    this.stopAnimation = function () {
        $("#loading").fadeOut(1000, function () {
            $(".wrapper").css("display", "block");
        });
    }

    this.resetMachine = function ($scope, machineParts) {
        if (this.getAuthKey()) {
            that = this;
            $scope.message = "<h4>Are you sure you want to reset machine?</h4><br><h5>This will reset exausted life of each part to zero and your history will be lost.</h5>";
            $scope.callback = function (r) {
                if (r) {
                    if (RESOURCES.serverSocket.readyState != 1) {
                        setTimeout(function () {
                            bootbox.alert({
                                title: "Alert",
                                backdrop: true,
                                message: "Connection lost! Please handshake again to perfom this operation.</br> Click Ok to Handshake.",
                                callback: function () {
                                    that.doInit();
                                }
                            });
                        }, 500);
                    } else {
                        that.startAnimation();
                        // console.log(machineParts);
                        var response_data = machineParts;
                        msg = 'CURRENT_COUNT=' + response_data.current_count + ',MACHINE_STATUS=' + response_data.status + ',ALERT=OFF,MACHINE_ID=' + response_data.id + ',OLD=NULL,TIME=1482407575,CMD=RESET,DCD_IP=' + response_data.dcd_linked_ip + '';
                        RESOURCES.serverSocket.send(msg);
                        RESOURCES.serverSocketMsg = null;
                        setTimeout(function () {
                            // console.log(RESOURCES.serverSocketMsg);
                            if (RESOURCES.serverSocketMsg != null) {
                                var promise = services.resetMachine($scope.id);
                                promise.then(function mySucces(r) {
                                    var r = r.data;
                                    // console.log(r);
                                    if (r.success) {
                                        toastr.success(r.msg);
                                        $scope.init();
                                        that.stopAnimation();
                                    }
                                });
                            } else {
                                toastr.error("Something went wrong.");
                                that.stopAnimation();
                            }
                        }, 15000);
                    }
                }
            }
            this.ConfirmMessageBox($scope.message, $scope.callback);
        } else {
            this.loginPopUp();
        }
    }

    this.turnOffOrOntMachine = function ($scope, machineParts) {
        var cmd;
        var msgStatus = "on";
        if (machineParts.status == "ON") {
            msgStatus = "off";
        }
        if (this.getAuthKey()) {
            that = this;
            $scope.message = "<h4> Do you really want to turn " + msgStatus + " the machine?</h4>";
            $scope.callback = function (r) {
                if (r) {
                    if (RESOURCES.serverSocket.readyState != 1) {
                        setTimeout(function () {
                            bootbox.alert({
                                title: "Alert",
                                backdrop: true,
                                message: "Connection lost! Please handshake again to perfom this operation.</br> Click Ok to Handshake.",
                                callback: function () {
                                    that.doInit();
                                }
                            });
                        }, 500);
                    } else {
                        that.startAnimation();
                        //console.log($scope.machineParts);
                        var response = machineParts;
                        if (response.status == "ON") {
                            cmd = "STOP";
                        } else if (response.status == "OFF") {
                            cmd = "START";
                        } else {

                        }

                        msg = 'CURRENT_COUNT=' + response.current_count + ',MACHINE_STATUS=' + response.status + ',ALERT=OFF,MACHINE_ID=' + response.id + ',OLD=NULL,TIME=1482407575,CMD=' + cmd + ',DCD_IP=' + response.dcd_linked_ip + '';
                        // console.log(msg);
                        RESOURCES.serverSocket.send(msg);
                        RESOURCES.serverSocketMsg = null;
                        setTimeout(function () {
                            if (RESOURCES.serverSocketMsg != null) {
                                $scope.init();
                                //$scope.refresh_currentcount(); 
                                if (cmd == "START") {
                                    toastr.success("Machine Turned ON successfully.!!!");
                                } else {
                                    toastr.success("Machine Turned Off successfully.!!!");
                                }
                                that.stopAnimation();
                            } else {
                                toastr.error("Something went wrong!!");
                                that.stopAnimation();
                            }
                        }, 15000);
                    }
                }
            }
            this.ConfirmMessageBox($scope.message, $scope.callback);
        } else {
            this.loginPopUp();
        }
    }
});

app.service('services', function (RESOURCES, $http) {
    this.listOfSqlFiles = [];
    this.setListOfSqlFiles = function (list) {
        this.listOfSqlFiles = list;
    };
    this.getListOfSqlFiles = function () {
        return this.listOfSqlFiles;
    };
    this.setNotificationCountAsRead = function () {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/notification/read",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.getMachineList = function () {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machines",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.saveEmailList = function (id, request) {
        return $http({
            method: 'POST',
            url: RESOURCES.SERVER_API + "client/machine/emails/save/" + id,
            dataType: 'json',
            data: request,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.deleteMachine = function (id) {
        return $http({
            method: 'DELETE',
            url: RESOURCES.SERVER_API + "client/machine/delete/" + id,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.getMachineDetailsByID = function (id) {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/" + id,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.saveMachine = function (id, request) {
        var url = null;
        var reqMethod = null;
        if (id) {
            url = RESOURCES.SERVER_API + "client/machine/update";
            reqMethod = 'PUT';
        } else {
            url = RESOURCES.SERVER_API + "client/machine/add";
            reqMethod = 'POST';
        }

        return $http({
            method: reqMethod,
            url: url,
            dataType: 'json',
            data: request,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.replacePart = function (id, current_count, action) {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/replace/part/" + id + "/current_count/" + current_count + "/action/" + action,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.getDepartment = function () {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/departments/",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.extendLife = function (id, action) {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/extend/part/" + id + "/action/" + action,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.resetMachine = function (id) {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/reset/" + id,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.loginUser = function (username, password) {
        return $http({
            method: 'POST',
            url: RESOURCES.SERVER_API + "user/login",
            dataType: 'json',
            data: {"username": username, "pwd": password},
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.changePassword = function (username, oldPassword, newPassword) {
        return $http({
            method: 'PUT',
            url: RESOURCES.SERVER_API + "/user/pwd/change",
            dataType: 'json',
            data: {"username": username, "pwd": oldPassword, "newPwd": newPassword},
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.getMailSettings = function () {
        return $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/mails/settings",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.sendTestMail = function (request) {
        return $http({
            method: 'POST',
            url: RESOURCES.SERVER_API + "client/mail/test",
            dataType: 'json',
            data: request,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.sendConfiguredMail = function (request) {
        return $http({
            method: 'POST',
            url: RESOURCES.SERVER_API + "client/mail/save",
            dataType: 'json',
            data: request,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.update_ip = function (request) {
        return $http({
            method: 'PUT',
            url: RESOURCES.SERVER_API + "client/machine/update_ip",
            dataType: 'json',
            data: request,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };

    this.resetAll = function () {
        return $http({
            method: 'POST',
            url: RESOURCES.SERVER_API + "dcd/reset_all",
            dataType: 'json',
            data: {},
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
    };
});

app.controller("mainCtrl", function ($scope, RESOURCES, services, $http, commom) {

    $scope.msg = "main";
});

app.controller("machineCtrl", function ($scope, RESOURCES, services, $http, $timeout, common, $route) {
    $scope.machineList = [];
    $scope.tpl = "template/partial/grid-view.html";
    $scope.showEmail = {
        recipient: [],
    };

    if (navigator.onLine) {

    }

    $scope.init = function () {

        var promise = services.getMachineList();
        promise.then(function mySucces(r) {

            if (r.data.success) {
                $scope.machineList = r.data.response;
                $scope.refresh();

            }
            if ($scope.machineList == '' || $scope.machineList == null) {
                $("#noMachineFoundModal").modal('show');
            }
        });
        if ($.cookie('viewType')) {
            $scope.tpl = $.cookie('viewType');
        }

    }

    $scope.addNewMachine = function () {
        // $('#addmachine').trigger('click');
        var href = $('#addmachine').attr('href');
        window.location.href = href;
    }

    $scope.showEmailPopUp = function ($event, $index) {
        $("#errrorMessage").hide();
        $scope.machine_name = $scope.machineList[$index].machine_name;
        // console.log($machine_name);
        $scope.showEmail.recipient = [];
        $scope.id = $scope.machineList[$index].id;
        $scope.email = $scope.showEmail.recipient;
        var row = $scope.machineList[$index];
        var cnt = 0,
                total = 5;
        if (row.emails.length > 0) {
            $.each(row.emails, function (k, v) {
                $scope.showEmail.recipient.push({
                    email: v
                });
                ++cnt;
            })
        }
        for (var i = cnt; i < total; i++) {
            $scope.showEmail.recipient.push({
                email: ''
            });
        }
        $("#emailModal").modal('show');
    }

    $scope.saveEmail = function () {
        var id = $scope.id;
        var request = [];

        $.each($scope.showEmail.recipient, function (k, v) {
            if (v.email != "")
                request.push(v.email);
        });

        if (request == "") {
            $("#errrorMessage").show();
            $("#errrorMessage").html("Please Enter at least one Email_ID.");

        } else {
            if (common.getAuthKey()) {
                $scope.submitEmail(id, request);
            } else {
                $("#emailModal").modal('hide');
                common.loginPopUp();

            }
        }
    }

    $scope.hideErrorMessage = function () {
        $("#errrorMessage").hide();
    }

    $scope.submitEmail = function (id, request) {
        if ($("#emailModalForm").valid()) {
            var promise = services.saveEmailList(id, request);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    toastr.success(r.data.msg);
                    $scope.refresh();
                    $("#emailModal").modal('hide');
                }
            });
        }
    }

    $scope.delete = function ($index) {
        if (common.getAuthKey()) {
            $scope.message = "<h4>Do you really want to delete this machine?</h4></br><p>It will Reset DCD Counters</p>";
            $scope.callback = function (r) {
                if (r) {
                    common.startAnimation();
                    //console.log($scope.machineList[$index]);
                    var response_data = $scope.machineList[$index];
                    msg = 'CURRENT_COUNT=0,MACHINE_STATUS=' + response_data.status + ',ALERT=OFF,MACHINE_ID=0,OLD=NULL,TIME=1482407575,CMD=STOP,DCD_IP=' + response_data.dcd_linked_ip + '';
                    RESOURCES.serverSocket.send(msg);
                    RESOURCES.serverSocketMsg = null;
                    setTimeout(function () {
                        // console.log(RESOURCES.serverSocketMsg);
                        if (RESOURCES.serverSocketMsg != null) {
                            var row = $scope.machineList[$index];
                            var promise = services.resetMachine(row.id);
                            promise.then(function mySucces(r) {
                                var r = r.data;
                                if (r.success) {
                                    var promise = services.deleteMachine(row.id);
                                    promise.then(function mySucces(r) {
                                        if (r.data.success) {
                                            toastr.success(r.data.msg, 'Congratulation!');
                                            // setTimeout(function() {
                                            $route.reload();
                                            $scope.init();
                                            // }, 1000)
                                        }
                                    });
                                    $scope.init();
                                    common.stopAnimation();
                                }
                            });
                        } else {
                            toastr.error("Something went wrong.");
                            common.stopAnimation();
                        }
                    }, 15000);
                }
            }
            common.ConfirmMessageBox($scope.message, $scope.callback);
        } else {
            common.loginPopUp();
        }
    }

    $scope.getMachineView = function (tp) {

        if (tp == undefined)
            $scope.tpl = "template/partial/grid-view.html";

        $scope.tpl = tp;
        $.cookie('viewType', $scope.tpl);
    }

    $scope.changeColor = function (status, alert_details) {
        if (status == "OFF") {
            $scope.color = 'bf-red';
        } else if (status == "ON" && alert_details == "Running Fine") {
            $scope.color = 'bf-green';
        } else {
            $scope.color = 'bf-orange';
        }
        return $scope.color;
    }
    $scope.changeTextColor = function (status, alert_details) {
        if (status == "OFF") {
            $scope.color = 'red';
        } else if (status == "ON" && alert_details == "Running Fine") {
            $scope.color = 'green';
        } else {
            $scope.color = 'orange';
        }
        return $scope.color;
    }

    $scope.init();

    common.hidePopup();

    $scope.refresh = function () {
        $timeout(function () {
            $scope.init();
        }, RESOURCES.REFRESH_INTERVAL)
    }
    $scope.init();
    common.hidePopup();
});

app.controller("machineDetailCtrl", function ($scope, $window, RESOURCES, services, $location, common, $http, $timeout) {
    $("#noMachineFoundModal").modal('hide');
    $scope.id = null;
    $scope.machine = [];

    $scope.init = function () {
        $scope.id = $location.search().id;
        if ($scope.id != null) {
            var promise = services.getMachineDetailsByID($scope.id);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    $scope.machine = r.data.response;
                    //console.log($scope.machine);
                    //common.getMachineListForPreviousAnsNext().setMachine($scope.machine);
                    $scope.refresh();
                }
            });
        }
    }

    $scope.init();
    common.hidePopup();


    $scope.changeColor = function (life_exhausted_till_date, alert_at_count, multiplying_factor, final_life) {

        if (life_exhausted_till_date < (alert_at_count * multiplying_factor)) {
            $scope.color = "green";
        } else if (life_exhausted_till_date >= final_life) {
            $scope.color = "red";
        } else {
            $scope.color = "orange";
        }
        return $scope.color;
    }

    $scope.downloadPdf = function ($event) {

        $event.preventDefault();

        $http.get('/controller/machine_history.php?type=pdf&id=' + $scope.id).success(function (r) {
            window.open(r.filenameLoc, '_newtab');
        });
    }

    $scope.saveExcel = function ($event) {
        $event.preventDefault();
        $http.get('/controller/machine_history.php?type=excel&id=' + $scope.id).success(function (r) {
            window.location.href = r.filenameLoc;
        });
    }

    $scope.refresh = function () {
        $timeout(function () {
            $scope.init();
        }, RESOURCES.REFRESH_INTERVAL)
    }

});

app.controller("addMachineCtrl", function ($scope, RESOURCES, services, $http, $location, $timeout, common, $window, $route) {
    // $("#btnClose").trigger('click');
    $("#noMachineFoundModal").modal('hide');
    $("#errrorMessage").hide();
    $scope.checked = false;
    $scope.type;
    $scope.index = 0;
    $scope.id = null;
    $scope.title = "Create Machine";
    $scope.departments = [];
    $scope.machineList = [];
    $scope.machineParts = {
        parts: [{
                spare_part_name: '',
                life: 1,
                multiplying_factor: 1,
                alert_gen_count: '',
                provision_of_life_exten: 'No',
                life_extn_limit: '',
                ext_life_alert_count: ''
            }],
        recipient: [{
                email: ''
            }, {
                email: ''
            }, {
                email: ''
            }, {
                email: ''
            }, {
                email: ''
            }],
        alert_gen_per: 80,
        extn_limit_per: 30,
        alert_extn_limit_per: 80,
        status: 'OFF',
        current_count: 0,
    };


    $scope.newPart = function () {
        //validateForm();
        $scope.machineParts.parts.push({
            spare_part_name: '',
            life: 1,
            multiplying_factor: 1,
            alert_gen_count: '',
            provision_of_life_exten: 'No',
            life_extn_limit: '',
            ext_life_alert_count: ''
        });

        $timeout(function () {
            $("#machinePartList >tbody >tr:last").find("input.spare_part_name").focus();
            if ($scope.machineParts.status == "OFF") {
                $("#machinePartList >tbody >tr:last").find("input.multiplying_factor").removeAttr("disabled");
                $("#machinePartList >tbody >tr:last").find("input.multiplying_factor").attr('title', '');
                $("#machinePartList >tbody >tr:last").find("[name^=provision_of_life_exten]").removeAttr("disabled");
                $("#machinePartList >tbody >tr:last").find("[name^=provision_of_life_exten]").removeAttr('title', '');
            } else {
                $("#machinePartList >tbody >tr:last").find("input.multiplying_factor").attr('title', 'To change this turn OFF Machine.');
                $("#machinePartList >tbody >tr:last").find("[name^=provision_of_life_exten]").attr('title', 'To change this turn OFF Machine.');
            }
            validateMulplyingFactor();

        }, 200);

    }

    $scope.removePart = function ($event) {
        $event.preventDefault;
        $check = $(".checkbox:checked");
        var checkLen = $check.length;

        if (checkLen > 0) {
            var _parts = [];
            $check.each(function () {
                _parts.push($(this).val());

            })

            for (var i = (checkLen - 1); i >= 0; i--) {
                var index = _parts[i];
                $scope.machineParts.parts.splice(index, 1)
            }

        } else {
            bootbox.alert({
                title: "Alert",
                backdrop: true,
                message: "<h5>Please select atleast one part to remove.</h5>",
            });
        }
    }

    $scope.init = function () {
        // $scope.view = $location.search().viewType;
        // console.log($scope.view);        
        $scope.id = $location.search().id;
        if ($scope.id > 0) {
            $scope.setDataById($scope.id);
            $scope.title = "Update Machine";

        }

        var promise = services.getDepartment();
        promise.then(function mySucces(data) {
            var r = data.data;
            $scope.departments = r.response;
        });
    }

    $scope.setDataById = function (id) {
        if (id != null) {
            var promise = services.getMachineDetailsByID(id);
            promise.then(function mySucces(data) {
                var r = data.data;
                if (r.success) {
                    var response = {
                        id: r.response.id,
                        machine_name: r.response.machine_name,
                        machine_code: r.response.machine_code,
                        current_count: r.response.current_count,
                        department: r.response.department,
                        dcd_linked_ip: r.response.dcd_linked_ip,
                        status: r.response.status,
                        alert_gen_per: r.response.alert_gen_perc,
                        extn_limit_per: r.response.life_extesn_perc,
                        alert_extn_limit_per: r.response.alert_gen_perc_of_extens_life,
                    };

                    response.recipient = [];
                    response.parts = [];

                    if (r.response.email !== null) {
                        var len = 0;
                        $.each(r.response.emails, function (k, v) {
                            response.recipient.push({
                                email: v
                            });
                            ++len;

                        })

                        if (len < 5) {
                            for (i = len; i < 5; i++)
                                response.recipient.push({
                                    email: ""
                                });
                        }

                    }

                    $.each(r.response.parts, function (k, v) {
                        var obj = {
                            "id": v.id,
                            "machine_id": v.machine_id,
                            "spare_part_name": v.spare_part_name,
                            "life": v.life,
                            "multiplying_factor": v.multiplying_factor,
                            "alert_gen_count": v.alert_gen_count,
                            "provision_of_life_exten": v.provision_of_life_exten,
                            "life_exhausted_till_date": v.life_exhausted_till_date,
                            "life_extn_limit": v.life_exten_limit,
                            "ext_life_alert_count": v.exten_life_alert_count,
                            "final_life": v.final_life,
                            "off_at_count": v.off_at_count,
                            "alert_at_count": v.alert_at_count,
                            "part_replace_count": v.part_replace_count,
                            "life_extended": v.life_extended,
                            "part_life_extend_count": v.part_life_extend_count,
                        };
                        response.parts.push(obj);
                    })
                    $scope.machineParts = response;
                }
            });
        }
    }

    $scope.setDataByIdForCopyMachine = function (id) {
        if (id != null) {
            var promise = services.getMachineDetailsByID(id);
            promise.then(function mySucces(data) {
                var r = data.data;
                if (r.success) {
                    var response = {
                        id: r.response.id,
                        machine_name: r.response.machine_name,
                        machine_code: r.response.machine_code,
                        current_count: 0,
                        department: r.response.department,
                        dcd_linked_ip: r.response.dcd_linked_ip,
                        status: "OFF",
                        alert_gen_per: r.response.alert_gen_perc,
                        extn_limit_per: r.response.life_extesn_perc,
                        alert_extn_limit_per: r.response.alert_gen_perc_of_extens_life,
                    };

                    response.recipient = [];
                    response.parts = [];

                    if (r.response.email !== null) {
                        var len = 0;
                        $.each(r.response.emails, function (k, v) {
                            response.recipient.push({
                                email: v
                            });
                            ++len;

                        })

                        if (len < 5) {
                            for (i = len; i < 5; i++)
                                response.recipient.push({
                                    email: ""
                                });
                        }

                    }

                    $.each(r.response.parts, function (k, v) {
                        var obj = {
                            "id": v.id,
                            "machine_id": v.machine_id,
                            "spare_part_name": v.spare_part_name,
                            "life": v.life,
                            "multiplying_factor": v.multiplying_factor,
                            "alert_gen_count": v.alert_gen_count,
                            "provision_of_life_exten": v.provision_of_life_exten,
                            "life_exhausted_till_date": 0,
                            "life_extn_limit": v.life_exten_limit,
                            "ext_life_alert_count": v.exten_life_alert_count,
                            "final_life": v.life,
                            "off_at_count": v.life,
                            "alert_at_count": v.alert_gen_count,
                            "part_replace_count": 0,
                            "life_extended": 0,
                            "part_life_extend_count": 0,
                        };
                        response.parts.push(obj);
                    })
                    $scope.machineParts = response;
                }
            });
        }

    }

    $scope.updateCount = function ($index) {
        var alertGenCount = Math.round(($scope.machineParts.parts[$index].life * (parseInt($scope.machineParts.alert_gen_per) / 100)));
        $scope.machineParts.parts[$index].alert_gen_count = alertGenCount;
        if ($scope.machineParts.parts[$index].provision_of_life_exten == 'Yes') {
            var lifeExtLimit = Math.round(($scope.machineParts.parts[$index].life * (parseInt($scope.machineParts.extn_limit_per) / 100)));
            $scope.machineParts.parts[$index].life_extn_limit = lifeExtLimit;
            var extLifeAlertCount = Math.round(($scope.machineParts.parts[$index].life_extn_limit * (parseInt($scope.machineParts.alert_extn_limit_per) / 100)));
            $scope.machineParts.parts[$index].ext_life_alert_count = extLifeAlertCount;
        }
        if ($scope.machineParts.parts[$index].provision_of_life_exten == 'No') {
            $scope.machineParts.parts[$index].life_extn_limit = 0;
            $scope.machineParts.parts[$index].ext_life_alert_count = 0;
        }
    }
    $scope.updateCounts = function ($index) {
        console.log("i am changed");
        if ($index == undefined) {
            angular.forEach($scope.machineParts.parts, function (value, $index) {
                $scope.updateCount($index);
            });
        } else {
            $scope.updateCount($index);
        }
    }

    $scope.submit = function ($event) {
        $event.preventDefault();
        if (common.getAuthKey()) {
            if ($("#createMachineForm").valid()) {
                var context = null;
                $scope.save($scope.prepareRequestByContext());
            }
        } else {
            common.loginPopUp();
        }

    };
    $scope.checkAllCheckBoxForMachineCongiguration = function () {
        $("#select_all").change(function () { //"select all" change 
            var status = this.checked; // "select all" checked status
            $('.checkbox').each(function () { //iterate all listed checkbox items
                this.checked = status; //change ".checkbox" checked status
            });
        });

        $('.checkbox').change(function () { //".checkbox" change 
            //uncheck "select all", if one of the listed checkbox item is unchecked
            if (this.checked == false) { //if this item is unchecked
                $("#select_all")[0].checked = false; //change "select all" checked status to false
            }

            //check "select all" if all checkbox items are checked
            if ($('.checkbox:checked').length == $('.checkbox').length) {
                $("#select_all")[0].checked = true; //change "select all" checked status to true
            }
        });
    }
    $scope.prepareRequestByContext = function () {

        var request = {
            machine_name: $scope.machineParts.machine_name,
            machine_code: $scope.machineParts.machine_name,
            current_count: $scope.machineParts.current_count,
            department: $scope.machineParts.department,
            dcd_linked_ip: $scope.machineParts.dcd_linked_ip,
            status: $scope.machineParts.status,
            alert_gen_perc: $scope.machineParts.alert_gen_per == "" ? 0 : $scope.machineParts.alert_gen_per,
            life_extesn_perc: $scope.machineParts.extn_limit_per = "" ? 0 : $scope.machineParts.extn_limit_per,
            alert_gen_perc_of_extens_life: $scope.machineParts.alert_extn_limit_per == "" ? 0 : $scope.machineParts.alert_extn_limit_per,
        };

        if ($scope.id) {
            request.id = $scope.id;
        }

        request.emails = [];
        request.parts = [];

        $.each($scope.machineParts.recipient, function (k, v) {
            if (v.email) {
                request.emails.push(v.email);
            }
        })
        $.each($scope.machineParts.parts, function (k, v) {
            var obj = {
                "spare_part_name": v.spare_part_name,
                "life": (v.life == "" ? 0 : v.life),
                "multiplying_factor": (v.multiplying_factor == "" ? 0 : v.multiplying_factor),
                "alert_gen_count": (v.alert_gen_count == "" ? 0 : v.alert_gen_count),
                "provision_of_life_exten": (v.provision_of_life_exten == "" ? 0 : v.provision_of_life_exten),
                "life_exhausted_till_date": v.life_exhausted_till_date,
                "life_exten_limit": (v.life_extn_limit == "" ? 0 : v.life_extn_limit),
                "exten_life_alert_count": (v.ext_life_alert_count == "" ? 0 : v.ext_life_alert_count),
            };

            if ($scope.id) {
                obj.id = v.id;
                obj.machine_id = $scope.id;
                obj.final_life = v.final_life;
                obj.off_at_count = v.off_at_count;
                obj.alert_at_count = v.alert_at_count;
                obj.part_replace_count = v.part_replace_count;
                obj.life_extended = v.life_extended;
                obj.part_life_extend_count = v.part_life_extend_count;
            }

            request.parts.push(obj);

        })
        // console.log(request);
        // console.log($scope.machineParts.parts);
        return request;
    }

    $scope.save = function (request) {
        if (request.emails == "") {
            $("#errrorMessage").show();
            $("#errrorMessage").html("Please Enter at least one Email_ID.");
        } else {
            var promise = services.saveMachine($scope.id, request);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    toastr.success(r.data.msg, 'Congratulation!');
                    setTimeout(function () {
                        $(".backBtn").trigger('click');
                    }, 2000)
                } else {
                    toastr.error(r.data.msg, 'Sorry!');
                }
            });
        }


    }

    $scope.hideErrorMessage = function () {
        $("#errrorMessage").hide();
    }

    // $scope.hideErrorMessage =function(){
    //     $("#errrorMessage").hide();
    // }

    $scope.resetMachine = function () {
        common.resetMachine($scope, $scope.machineParts);
    }

    $scope.turnOffOrOntMachine = function () {
        common.turnOffOrOntMachine($scope, $scope.machineParts);
    }

    $scope.getMachineList = function () {
        var promise = services.getMachineList();
        promise.then(function mySucces(r) {
            if (r.data.success) {
                $scope.machineList = r.data.response;
            }
        });
    }

    $scope.setDataForCopyMachine = function (id) {
        // $event.preventDefault();
        $scope.setDataByIdForCopyMachine(id);
        setTimeout(function () {
            $scope.machineParts.machine_name = "";
            $scope.machineParts.department = "";
            $scope.machineParts.dcd_linked_ip = "";
        }, 100);

    }

    $scope.update_ip = function () {
        if ($('#replaceHW-form').valid()) {
            var request = {
                dcd_linked_ip: $scope.new_dcd_linked_ip,
                id: $scope.id
            };
            // console.log(request);
            var promise = services.update_ip(request);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    $("#replaceHW-modal").modal("hide");
                    toastr.success(r.data.msg, 'Congratulation!');
                } else {
                    toastr.error(r.data.msg, 'Sorry!');
                }
            });
        }

    }

    //$scope.getMachineList();
    $scope.replaceEachPart = function ($index) {
        // console.log($index);
        var row = $scope.machineParts.parts[$index];
        // console.log($scope.machineParts);
        $scope.message = "<h4>Are you sure you want to replace the part <b>" + row.spare_part_name + "</b>? </h4><h5> It's Life will reset to <b>" + row.life + ".</b></h5>";
        if (common.getAuthKey()) {
            $scope.callback = function (r) {
                if (r) {
                    $scope.action = "update";
                    var promise = services.replacePart(row.id, $scope.machineParts.current_count, $scope.action);
                    promise.then(function mySucces(r) {

                        if (r.data.success) {
                            //toastr.success(r.data.msg, 'Congratulation!');
                            // toastr.success('Congratulation! Part Replaced successfully.!!!');
                            msg = 'CURRENT_COUNT=' + $scope.machineParts.current_count + ',MACHINE_STATUS=' + $scope.machineParts.status + ',ALERT=OFF,MACHINE_ID=' + $scope.machineParts.id + ',OLD=NULL,TIME=1482407575,CMD=PART,DCD_IP=' + $scope.machineParts.dcd_linked_ip + '';

                            RESOURCES.serverSocket.send(msg);
                            RESOURCES.serverSocketMsg = null;
                            common.startAnimation();
                            $timeout(function () {
                                if (RESOURCES.serverSocketMsg != null) {
                                    $scope.action = "resolve";
                                    var promise = services.replacePart(row.id, $scope.machineParts.current_count, $scope.action);
                                    promise.then(function mySucces(r) {
                                        if (r.data.success) {
                                            common.stopAnimation();
                                            $scope.init();
                                            toastr.success('Congratulation! Part Replaced successfully.!!!');
                                        } else {
                                            toastr.error(r.data.msg, 'Sorry!');
                                            common.stopAnimation();
                                        }
                                    });

                                } else {
                                    $scope.action = "rollback";
                                    var promise = services.replacePart(row.id, $scope.machineParts.current_count, $scope.action);
                                    promise.then(function mySucces(r) {
                                        if (r.data.success) {
                                            common.stopAnimation();
                                            toastr.error("Something went wrong.");
                                        }
                                    });
                                }

                            }, 15000);
                        } else {
                            toastr.error(r.data.msg, 'Sorry!');
                        }
                    });
                }
            }
            common.ConfirmMessageBox($scope.message, $scope.callback);
        } else {
            common.loginPopUp();
        }
    }

    $scope.getLifeLimit = function (currentCount, multiplicationFactor) {
        currentCount = (currentCount == undefined ? 0 : currentCount);
        return parseFloat(currentCount) * parseFloat(multiplicationFactor);
    }

    // $scope.changeFinalLife = function(index) {
    //     console.log($scope.machineParts.parts[index].life);
    //     console.log($scope.machineParts.parts[index]);

    // }

    $scope.buttonsPressCount = function (id) {
        if (id != null) {
            var promise = services.getMachineDetailsByID(id);
            promise.then(function mySucces(data) {
                var r = data.data;
                if (r.success) {
                    $scope.refresh_count = r.response.current_count;
                    $scope.machine_status = r.response.status;
                    $scope.machineParts.dcd_linked_ip = r.response.dcd_linked_ip;
                    //console.log($scope.machine_status);  
                    $scope.refresh_currentcount();
                }
            });
        }

    }

    $scope.refresh_currentcount = function () {
        $timeout(function () {
            $scope.buttonsPressCount($scope.id);
        }, 1000);
    }

    $scope.calLifeLimit = function (finalLife, multiplyingFactor) {
        console.log(parseInt(finalLife) / parseInt(multiplyingFactor));

        return parseInt(finalLife) / parseInt(multiplyingFactor);
    }

    $scope.init();
    common.hidePopup();
    $scope.buttonsPressCount($scope.id);

});

app.controller("partsHistroyCtrl", function ($scope, $window, RESOURCES, services, $location, common, $http) {
    $scope.pid = null;
    $scope.length = null;
    $scope.sr = null;
    $scope.partDtls = [];
    $scope.machine = [];

    $scope.start = function () {
        $scope.length = $location.search().len;
        $scope.sr = $location.search().count;
        $scope.pid = $location.search().id;
        $.ajax({
            type: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/history/" + $scope.pid,
            dataType: 'json',
            data: {},
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            async: false,
            success: function (r) {
                console.log(r);
                if (r.success) {
                    console.log("i m in");
                    $scope.partDtls = r.response;
                    for (var i = 0; i < $scope.partDtls.part_history.length; i++) {
                        var dateTime = $scope.partDtls.part_history[i].added_on.split('.');
                        $scope.partDtls.part_history[i].added_on = dateTime[0];
                    }
                    // console.log($scope.partDtls);
                }

            }
        });

    }

    $scope.getMachineDetails = function () {
        $scope.id = $scope.partDtls.id;
        var promise = services.getMachineDetailsByID($scope.id);
        promise.then(function mySucces(r) {
            if (r.data.success) {
                $scope.machine = r.data.response;
                // console.log($scope.machine);
            }
        });
    }

    $scope.downloadPdf = function ($event) {

        $event.preventDefault();
        $http.get('/controller/machine_part_history.php?type=pdf&id=' + $scope.pid + '&len=' + $scope.length + '&count=' + $scope.sr).success(function (r) {
            // $http.get('/controller/machine_part_history.php?type=pdf&id='+ $scope.pid).success(function(r){
            window.open(r.filenameLoc, '_newtab');
        });
    }

    $scope.saveExcel = function ($event) {

        $event.preventDefault();

        $http.get('/controller/machine_part_history.php?type=excel&id=' + $scope.pid + '&len=' + $scope.length + '&count=' + $scope.sr).success(function (r) {
            window.location.href = r.filenameLoc;
        });
    }

    $scope.showdate = function () {
        var d = ($scope.partDtls.part_history).length;

        for (var i = 0; i < d; i++) {
            $scope.added_on = $scope.partDtls.part_history[i].added_on;
            $scope.date_time = $scope.added_on.split(".");
            $scope.date = $scope.date_time[0];
        }

    }
    $scope.next = function (id) {
        $("#open_" + id).trigger('click');
    }

    $scope.getCurrentIndexOfPartId = function () {
        $scope.list = $scope.machine.parts;
        for (var i = 0; i < $scope.list.length; i++) {
            if ($scope.list[i].id == $scope.pid) {
                return i;
            }
        }
    }

    $scope.nextPart = function () {
        $scope.index = $scope.getCurrentIndexOfPartId();
        $scope.nextId = $scope.machine.parts[$scope.index + 1].id;
        $scope.sr = parseInt($scope.sr);
        $scope.path = '/part/history?id=' + $scope.nextId + '&len=' + $scope.length + '&count=' + ($scope.sr + 1);
        $location.url($scope.path).replace();
    };

    $scope.previousPart = function () {
        $scope.index = $scope.getCurrentIndexOfPartId();
        $scope.nextId = $scope.machine.parts[$scope.index - 1].id;
        $scope.sr = parseInt($scope.sr);
        $scope.path = '/part/history?id=' + $scope.nextId + '&len=' + $scope.length + '&count=' + ($scope.sr - 1);
        $location.url($scope.path).replace();
    };


    $scope.start();
    $scope.getMachineDetails();
    $scope.showdate();
    common.hidePopup();

    $scope.refresh = function () {
        $timeout(function () {
            $scope.start();
        }, RESOURCES.REFRESH_INTERVAL)
    }


});

app.controller("machineListStatusCtrl", function ($scope, $timeout, RESOURCES, $http, services, common, Scopes) {
    $scope.machineList = [];
    // Scopes.store('machineListStatusCtrl', $scope);
    $scope.init = function () {
        $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/notifications",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }).then(function mySucces(r) {
            if (r.data.success) {
                $scope.machineList = r.data.response;
                $scope.refresh();
            } else {
                $scope.machineList = [];
            }
        });
    }

    $scope.init();
    console.log("machine object");
    console.log($scope.machineList);
    common.hidePopup();

    $scope.refresh = function () {
        $timeout(function () {
            $scope.init();
        }, RESOURCES.REFRESH_INTERVAL)
    }

});

app.controller("machinePartStatusCtrl", function ($scope, $timeout, services, RESOURCES, $http, $location, common) {
    $scope.machine = [];
    $scope.init = function () {
        $scope.pid = $location.search().id;
        $http({
            method: 'GET',
            url: RESOURCES.SERVER_API + "client/machine/notifications/" + $scope.pid,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }).then(function mySucces(r) {
            if (r.data.success) {
                $scope.machine = r.data.response;
                //console.log($scope.machine);
                $scope.refresh();
            }
        });
    }
    $scope.init();
    common.hidePopup();

    $scope.refresh = function () {
        $timeout(function () {
            $scope.init();
        }, RESOURCES.REFRESH_INTERVAL)
    }

    $scope.replacePart = function ($index) {
        var row = $scope.machine.parts[$index];
        console.log($scope.machine);
        $scope.message = "<h4>Are you sure you want to replace the part <b>" + row.spare_part_name + "</b>? </h4><h5> It's Life will reset to <b>" + row.life + ".</b></h5>";
        if (common.getAuthKey()) {
            $scope.callback = function (r) {
                if (r) {
                    if (RESOURCES.serverSocket.readyState != 1) {
                        setTimeout(function () {
                            bootbox.alert({
                                title: "Alert",
                                backdrop: true,
                                message: "Connection lost! Please handshake again to perfom this operation.</br> Click Ok to Handshake.",
                                callback: function () {
                                    common.doInit();
                                }
                            });
                        }, 500);
                    } else {
                        $scope.action = "update";
                        var promise = services.replacePart(row.id, $scope.machine.current_count, $scope.action);
                        promise.then(function mySucces(r) {
                            if (r.data.success) {
                                // toastr.success(r.data.msg, 'Congratulation!');
                                msg = 'CURRENT_COUNT=' + $scope.machine.current_count + ',MACHINE_STATUS=' + $scope.machine.status + ',ALERT=OFF,MACHINE_ID=' + $scope.machine.id + ',OLD=NULL,TIME=1482407575,CMD=PART,DCD_IP=' + $scope.machine.dcd_linked_ip + '';
                                console.log(msg);
                                RESOURCES.serverSocket.send(msg);
                                RESOURCES.serverSocketMsg = null;
                                common.startAnimation();
                                setTimeout(function () {
                                    console.log(RESOURCES.serverSocketMsg);
                                    if (RESOURCES.serverSocketMsg != null) {
                                        $scope.action = "resolve";
                                        var promise = services.replacePart(row.id, $scope.machine.current_count, $scope.action);
                                        promise.then(function mySucces(r) {
                                            if (r.data.success) {
                                                common.stopAnimation();
                                                toastr.success(r.data.msg, 'Congratulation!');
                                                setTimeout(function () {
                                                    if (r.data.response == "" || r.data.response == null) {
                                                        $("#goto-machine-status").trigger('click');
//                                                window.location.replace("/machine/statuslist");
//                                                angular.element('#goto-machine-status').triggerHandler('click');
                                                    } else {
                                                        $scope.init();
                                                    }
                                                }, 500);
                                            } else {
                                                toastr.error(r.data.msg, 'Sorry!');
                                                common.stopAnimation();
                                            }
                                        });

                                    } else {
                                        $scope.action = "rollback";
                                        var promise = services.replacePart(row.id, $scope.machine.current_count, $scope.action);
                                        promise.then(function mySucces(r) {
                                            if (r.data.success) {
                                                common.stopAnimation();
                                                toastr.error("Something went wrong.");
                                            }
                                        });
                                    }

                                }, 15000);
                            } else {
                                common.stopAnimation();
                                toastr.error(r.data.msg, 'Sorry!');
                            }
                        });
                    }
                }
            }
            common.ConfirmMessageBox($scope.message, $scope.callback);
        } else {
            common.loginPopUp();
        }

    }
    $scope.extendLife = function ($index) {
        var row = $scope.machine.parts[$index];
        $scope.message = "<h4>Are you sure you want to extend life of <b>" + row.spare_part_name + "</b>? </h4><h5> It's Life will exceed by <b>" + row.life_exten_limit + ".</b></h5>";
        if (common.getAuthKey()) {
            $scope.callback = function (r) {
                if (r) {
                    if (RESOURCES.serverSocket.readyState != 1) {
                        setTimeout(function () {
                            bootbox.alert({
                                title: "Alert",
                                backdrop: true,
                                message: "Connection lost! Please handshake again to perfom this operation.</br> Click Ok to Handshake.",
                                callback: function () {
                                    common.doInit();
                                }
                            });
                        }, 500);
                    } else {
                        $scope.action = "update";
                        var promise = services.extendLife(row.id, $scope.action);
                        promise.then(function mySucces(r) {
                            if (r.data.success) {
                                // toastr.success(r.data.msg, 'Congratulation!');
                                msg = 'CURRENT_COUNT=' + $scope.machine.current_count + ',MACHINE_STATUS=' + $scope.machine.status + ',ALERT=OFF,MACHINE_ID=' + $scope.machine.id + ',OLD=NULL,TIME=1482407575,CMD=EXTD,DCD_IP=' + $scope.machine.dcd_linked_ip + '';

                                RESOURCES.serverSocket.send(msg);
                                RESOURCES.serverSocketMsg = null;
                                common.startAnimation();
                                $timeout(function () {
                                    if (RESOURCES.serverSocketMsg != null) {
                                        $scope.action = "resolve";
                                        var promise = services.extendLife(row.id, $scope.action);
                                        promise.then(function mySucces(r) {
                                            if (r.data.success) {
                                                common.stopAnimation();
                                                toastr.success(r.data.msg, 'Congratulation!');
                                                setTimeout(function () {
                                                    if (r.data.response == "" || r.data.response == null) {
                                                        // $("#goto-machine-status").trigger("click");
                                                        $("#goto-machine-status").trigger('click');
                                                        //angular.element('#goto-machine-status').trigger('click');
                                                    } else {
                                                        $scope.init();
                                                    }
                                                }, 500);
                                            } else {
                                                common.stopAnimation();
                                                toastr.error(r.data.msg, 'Sorry!');
                                            }
                                        });
                                    } else {
                                        $scope.action = "rollback";
                                        var promise = services.extendLife(row.id, $scope.action);
                                        promise.then(function mySucces(r) {
                                            if (r.data.success) {
                                                common.stopAnimation();
                                                toastr.error("Something went wrong.");
                                            }
                                        })
                                    }

                                }, 10000);
                            } else {
                                toastr.error(r.data.msg, 'Sorry!');
                            }
                        });
                    }
                }
            }
            common.ConfirmMessageBox($scope.message, $scope.callback);
        } else {
            common.loginPopUp();
        }
    }

});

app.controller("alertCtrl", function ($scope, RESOURCES, $http, $timeout, $interval, services, common, Scopes) {
    $scope.data = [];
    Scopes.store('alertCtrl', $scope);

    $scope.init = function () {
        $interval(function () {
            $http({
                method: 'GET',
                url: RESOURCES.SERVER_API + "client/machine/notification/count",
                dataType: 'json',
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }).then(function mySucces(r) {
                if (r.data.success) {
                    $scope.data = r.data.response;
//                  $scope.refresh();
                    $scope.showAlert();
                }
            });

        }, RESOURCES.REFRESH_INTERVAL)
    }

    $scope.showAlert = function () {
        if ($scope.data.turned_off_machine_names !== null && $scope.data.turned_off_machine_names.length > 0) {
            var text = "Dear user, machine (";
            var list = "";

            $.each($scope.data.turned_off_machine_names, function (k, v) {
                list += v + ',';
            })

            list = list.replace(/,\s*$/, "");
            text += (list + ") require your attention!");

            toastr.error(text, 'Machine Alert!', {
                timeOut: 3000
            });
            // toastr.options.onHidden = function() {
            //     console.log("onHide");
            // };
            // toastr.options.onclick = function() { console.log('clicked'); }
        }
    }

    $scope.init();
    common.hidePopup();

    $scope.refresh = function () {
        $timeout(function () {
            $scope.init();
        }, RESOURCES.REFRESH_INTERVAL)
    }

    $scope.reset = function () {
        var promise = services.setNotificationCountAsRead();
        promise.then(function mySucces(r) {
            if (r.data.success) {
                $scope.data.count = 0;
            }
        });
    }
});

app.controller("viewMachineCtrl", function ($scope, RESOURCES, $timeout, $http, $location, services, common, Scopes) {
    $scope.index = 0;
    $scope.id = null;
    $scope.machineParts = {};

    $scope.init = function () {
        $scope.id = $location.search().id;
        if ($scope.id > 0) {
            $scope.setMachineDataById($scope.id);
        }
    }

    $scope.setMachineDataById = function (id) {
        if ($scope.id != null) {
            var promise = services.getMachineDetailsByID($scope.id);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    $scope.machineParts = r.data.response;
                    for (var i = 0; i < $scope.machineParts.parts.length; i++) {
                        var finalLife = Math.round($scope.machineParts.parts[i].final_life / $scope.machineParts.parts[i].multiplying_factor);
                        var extendLife = Math.round($scope.machineParts.parts[i].life_exten_limit / $scope.machineParts.parts[i].multiplying_factor);
                        var extendLifeAlert = Math.round($scope.machineParts.parts[i].exten_life_alert_count / $scope.machineParts.parts[i].multiplying_factor);
                        $scope.machineParts.parts[i].final_life = finalLife;
                        $scope.machineParts.parts[i].life_exten_limit = extendLife;
                        $scope.machineParts.parts[i].exten_life_alert_count = extendLifeAlert;
                        // console.log(extendLife);
                    }

                    $scope.refresh();
                }
            });
        }
    }

    $scope.refresh = function () {
        $timeout(function () {
            $scope.init();
//            Scopes.get('alertCtrl').init();
        }, RESOURCES.REFRESH_INTERVAL);
    }

    $scope.init();
    common.hidePopup();

    $scope.changeColor = function (life_exhausted_till_date, alert_at_count, multiplying_factor, final_life) {
        if ((life_exhausted_till_date / multiplying_factor) < (alert_at_count)) {
            $scope.color = "green";
        } else if ((life_exhausted_till_date / multiplying_factor) >= final_life) {
            $scope.color = "red";
            //Scopes.get('alertCtrl').init();
            // Scopes.get('machineListStatusCtrl').init();

        } else {
            $scope.color = "orange";
            // Scopes.get('alertCtrl').init();
            // Scopes.get('machineListStatusCtrl').init();

        }
        return $scope.color;
    }

    $scope.resetMachine = function () {
        common.resetMachine($scope, $scope.machineParts);
    }
    $scope.turnOffOrOntMachine = function () {
        common.turnOffOrOntMachine($scope, $scope.machineParts);
    }


    // $scope.resetMachine = function() {
    //     if (common.getAuthKey()) {
    //         $scope.message = "<h4>Are you sure you want to reset machine?</h4><br><h5>This will reset exausted life of each part to zero and your history will be lost.</h5>";
    //         $scope.callback = function(r) {
    //             if (r) {
    //                 if(RESOURCES.serverSocket.readyState != 1){
    //                     bootbox.alert({ 
    //                       title: "Alert",
    //                        backdrop: true,
    //                       message: "Connection lost! Please handshake again to perfom this operation.</br> Click Ok to Handshake.", 
    //                       callback: function(){ common.doInit();  }
    //                     });
    //                 }  else{
    //                     common.startAnimation();
    //                     console.log($scope.machineParts);
    //                     var response_data = $scope.machineParts;
    //                     msg = 'CURRENT_COUNT=' + response_data.current_count + ',MACHINE_STATUS=' + response_data.status + ',ALERT=OFF,MACHINE_ID=' + response_data.id + ',OLD=NULL,TIME=1482407575,CMD=RESET,DCD_IP=' + response_data.dcd_linked_ip + '';
    //                     RESOURCES.serverSocket.send(msg);
    //                     setTimeout(function() {
    //                         console.log(RESOURCES.serverSocketMsg);
    //                         if(RESOURCES.serverSocketMsg != null){
    //                             var promise = services.resetMachine($scope.id);
    //                             promise.then(function mySucces(r) {
    //                                 var r = r.data;
    //                                 console.log(r);
    //                                 if (r.success) {
    //                                     toastr.success(r.msg);  
    //                                     $scope.init();
    //                                     common.stopAnimation();
    //                                 }
    //                             });
    //                          }else{
    //                              toastr.error("Something went wrong.");  
    //                              common.stopAnimation();
    //                         }
    //                     }, 15000);
    //                     // var promise = services.resetMachine($scope.id);
    //                     // promise.then(function mySucces(r) {
    //                     //     var r = r.data;
    //                     //     console.log(r);
    //                     //     if (r.success) {
    //                     //         toastr.success(r.msg);
    //                     //         msg = 'CURRENT_COUNT=' + r.response.current_count + ',MACHINE_STATUS=' + r.response.status + ',ALERT=OFF,MACHINE_ID=' + r.response.id + ',OLD=NULL,TIME=1482407575,CMD=RESET,DCD_IP=' + r.response.dcd_linked_ip + '';
    //                     //         RESOURCES.serverSocket.send(msg);
    //                     //         $scope.init();
    //                     //     }
    //                     // });
    //                 }
    //             }
    //         }
    //         common.ConfirmMessageBox($scope.message, $scope.callback);
    //     } else {
    //         common.loginPopUp();

    //     }

    // }


    // $scope.turnOffOrOntMachine = function(event) {
    //     var cmd;
    //     //console.log($scope.machineParts);
    //     var msgStatus = "on";
    //     if($scope.machineParts.status=="ON"){
    //         msgStatus = "off";
    //         console.log(msgStatus);
    //     }
    //     if (common.getAuthKey()) {
    //         $scope.message = "<h4> Do you really want to turn "+msgStatus+" the machine?</h4>";
    //         $scope.callback = function(r) {
    //             if (r) {

    //                 if(RESOURCES.serverSocket.readyState != 1){
    //                   setTimeout(function() {  bootbox.alert({ 
    //                       title: "Alert",
    //                       backdrop: true,
    //                       message: "Connection lost! Please handshake again to perfom this operation.</br> Click Ok to Handshake.", 
    //                       callback: function(){//common.doInit();
    //                       }
    //                     });
    //                    }, 500);
    //                 }  else{
    //                     console.log($scope.machineParts);
    //                     var response = $scope.machineParts;
    //                     if (response.status == "ON") {
    //                         cmd = "STOP";
    //                     } else if (response.status == "OFF") {
    //                         cmd = "START";
    //                     } else {

    //                     }
    //                     msg = 'CURRENT_COUNT=' + response.current_count + ',MACHINE_STATUS=' + response.status + ',ALERT=OFF,MACHINE_ID=' + response.id + ',OLD=NULL,TIME=1482407575,CMD=' + cmd + ',DCD_IP=' + response.dcd_linked_ip + '';
    //                     console.log(msg);
    //                     RESOURCES.serverSocket.send(msg);
    //                     // $scope.init();
    //                     $scope.$apply(function() {
    //                  $scope.init();
    //                 //RESOURCES.serverSocketStatus = false;
    //             });
    //                 }
    //             }
    //         }
    //         common.ConfirmMessageBox($scope.message, $scope.callback);

    //     } else {
    //         common.loginPopUp();
    //     }
    // }

});

function showLoginModal() {
    //console.log('login model');
    //$("#loginScreen").css({"display":"block"}); 
    $("#login-modal").modal('show');
    $("#login-form")[0].reset();
    $('#username').focus();
    $("#errorSectionForLogin").css({"display": "none"});
    $('input').removeClass('error');
    $('.error').hide();

}

function showReplaceHWModal() {
    //console.log('login model');
    //$("#loginScreen").css({"display":"block"}); 
    $("#replaceHW-modal").modal('show');
    $("#replaceHW-form")[0].reset();
    $('input').removeClass('error');
    $('.error').hide();

}

function showChangePasswordModal() {
    //console.log('login model');
    //$("#loginScreen").css({"display":"block"}); 
    $("#changePasswordModal").modal('show');
    $("#changePasswordForm")[0].reset();
    $('input').removeClass('error');
    $('.error').hide();
    // $('label').show();
    //$('label').show();
}

function showConfigureSenderEmailModal() {
    //console.log('login model');
    //$("#loginScreen").css({"display":"block"});    
    $("#configureSenderEmailModal").modal('show');
    $("#configureSenderEmailForm")[0].reset();
    $('input').removeClass('error');
    $('.error').hide();
    // $('label').show();
    $('label').show();
}

app.controller("loginCtrl", function ($scope, services, $http, $location, common, $route, $window) {
    // $("#loginScreen").css({"display":"block"});
    $scope.userInfo = $.cookie('authKey');
    $scope.username;
    $scope.password;

    $scope.submit = function ($event) {
        if ($("#login-form").valid()) {
            var promise = services.loginUser($scope.username, $scope.password);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    // console.log(r.data);
                    common.setAuthKey($scope.username);
                    common.doInit();
                    //$route.reload();
                    //$window.location.reload();
                    $("#login-modal").modal('hide');

                } else {
                    $("#errorSectionForLogin").css({"display": "block"});
                    $("#login-form")[0].reset();
                    //toastr.error(r.data.msg);
                }
            });
        }
    }
});

app.controller("menuCtrl", function ($scope, $window, services, $http, $location, common, RESOURCES) {
    $scope.fileName = "";
    $scope.listOfSQLFiles = services.listOfSqlFiles;

    $scope.canAccess = function () {
        $scope.userInfo = $.cookie('authKey');
        return common.getAuthKey();
    }
    $scope.logout = function () {
        $scope.message = "<h4>Are you sure you want to Logout?</h4>";
        $scope.callback = function (r) {
            if (r) {
                $.removeCookie("authKey");
                $scope.$apply(function () {
                    $scope.canAccess();
                    RESOURCES.serverSocketStatus = false;
                });
            }
        }
        common.ConfirmMessageBox($scope.message, $scope.callback);
    }

    $scope.backUpDatabase = function ($event) {
        $event.preventDefault();
        common.startAnimation();
        $http.get('/controller/backup.php').success(function (r) {
            common.stopAnimation();
            toastr.success("Backed Up successfully!!!");
        });
    }

    $scope.restore = function () {
        common.startAnimation();
        $http.get('/controller/file.php').success(function (r) {
            common.stopAnimation();
            r.shift();
            r.shift();
            $scope.listOfSQLFiles.list = r;
            bootbox.alert({
                title: "Have you closed your server???",
                backdrop: true,
                message: "<h5>Before restoring the backup file, close the WebSocket server.<br>Restore your backup file and then start the server again.</h5>",
                callback: function () {
                    setTimeout(function () {
                        $('#list').modal('show');
                    }, 100)
                    // console.log($scope.listOfSQLFiles.list);
                }
            });
            // $scope.fileName =$scope.listOfSQLFiles.list[0];

        });
    }

    // $scope.submit = function(){  
    //         console.log($scope.fileName);    
    // }  

    $scope.submit = function ($event) {
        //$event.preventDefault();
        $http.get('/controller/restore.php?name=' + $scope.fileName).success(function (r) {
            // window.location.href = r.filenameLoc; 
            // console.log(r);
            var promise = services.resetAll();
            promise.then(function mySucces(r) {
                $('#list').modal('hide');
                toastr.success("Backed Up successfully!!!");
                window.location.href = "/";
            });
        });
    }

});

app.controller("changePasswordCtrl", function ($scope, services, $http, $location, $route) {

    // validateConfirmPassword();
    $route.reload();
    //$scope.userInfo =  $.cookie('authKey');
    $scope.userInfo = "ADMIN";
    $scope.oldPassword;
    $scope.newPassword;
    $scope.confirmpassword;

    $scope.submitPassword = function () {

        if ($("#changePasswordForm").valid()) {
            var promise = services.changePassword($scope.userInfo, $scope.oldPassword, $scope.newPassword);
            promise.then(function mySucces(r) {
                if (r.data.success) {
                    $("#changePasswordModal").modal('hide');
                } else {
                    $("#errorSectionForChangePassword").css({"display": "block"});
                    $("#errorSectionForChangePassword span i").text(r.data.msg);
                    $("#changePasswordForm")[0].reset();
                    //toastr.error(r.data.msg);
                }
            });
        }
    }

});

app.controller("configureSenderEmailCtrl", function ($scope, $timeout, blockUIConfig, services, blockUI, $http, $location, common) {

    $scope.userInfo = $.cookie('authKey');
    $scope.emailDtls = [];

    $scope.setEmailDataSettings = function () {
        var promise = services.getMailSettings();
        promise.then(function mySucces(r) {
            if (r.data.success) {
                $scope.emailDtls = r.data.response;
            }
        });
    }

    $scope.submitEmailConfiguration = function ($event) {
        $event.preventDefault();
        if ($("#configureSenderEmailForm").valid()) {
            var context = null;
            $scope.sendEmailConfiguration($scope.prepareRequestByContext());
        }
    }

    $scope.sendEmailConfiguration = function (request) {
        blockUIConfig.autoBlock = true;
        var promise = services.sendConfiguredMail(request);
        promise.then(function mySucces(r) {
            // console.log(r);
            if (r.data.success) {
                blockUIConfig.autoBlock = false;
                toastr.success(r.data.msg);
                $("#configureSenderEmailModal").modal('hide');
            } else {
                $("#errorSectionForconfigureSenderEmail").css({"display": "block"});
                $("#errorSectionForconfigureSenderEmail span i").text(r.data.msg);
                $("#configureSenderEmailForm")[0].reset();
                toastr.error(r.data.msg);
            }
        });
    }

    $scope.sendTestMail = function ($event) {
        $event.preventDefault();
        if (common.getAuthKey()) {
            if ($("#configureSenderEmailForm").valid()) {
                var context = null;
                $scope.saveEmailConfiguration($scope.prepareRequestByContext());
            }
        } else {
            common.loginPopUp();
        }
    }

    $scope.prepareRequestByContext = function () {

        var request = {
            "host": $scope.emailDtls.host,
            "port": $scope.emailDtls.port,
            "email": $scope.emailDtls.email,
            "email_pwd": $scope.emailDtls.email_pwd,
            "mail_to": $scope.mail_to,
            "mail_body": $scope.mail_body
        };
        // console.log(request);
        return request;
    }


    $scope.saveEmailConfiguration = function (request) {
        // var formId = $('#submitEmailConfiguration');
        //console.log(formId);
        blockUIConfig.autoBlock = true;
        var promise = services.sendTestMail(request);
        promise.then(function mySucces(r) {
            // console.log(r.data.response);
            if (r.data.success) {
                blockUIConfig.autoBlock = false;
                $('#submitEmailConfiguration').attr('disabled', false);
                toastr.success('Mail sent successfully. Now click on Save button to complete the configuration.');
            } else {
                toastr.error("Message not sent!!!<br>Either you have entered invalid Username & Password OR you haven't turned on GMail's lesssecureapps settings.");
            }
        });

    }

    $scope.disableSaveButton = function () {
        $('#submitEmailConfiguration').attr('disabled', true);
    }

    $scope.setEmailDataSettings();

});


app.config(function ($routeProvider, $locationProvider, blockUIConfig) {
    $routeProvider
            .when("/home", {
                templateUrl: "template/main.html",
                controller: "mainCtrl"
            })
            .when("/", {
                templateUrl: "template/machine-list.html",
                controller: "machineCtrl"
            })
            .when("/machine-list", {
                templateUrl: "template/machine-list.html",
                controller: "machineCtrl"
            })
            .when("/add-machine", {
                templateUrl: "template/add-machine.html",
                controller: "addMachineCtrl"
            })
            .when("/machine/update", {
                templateUrl: "template/add-machine.html",
                controller: "addMachineCtrl"
            })
            .when("/machine/view", {
                templateUrl: "template/machine.html",
                controller: "machineDetailCtrl"
            })
            .when("/machine/statuslist", {
                templateUrl: "template/machine-status.html",
                controller: "machineListStatusCtrl"
            })
            .when("/machine/status", {
                templateUrl: "template/machine-part-status.html",
                controller: "machinePartStatusCtrl"
            })
            .when("/part/history", {
                templateUrl: "template/machine-part.html",
                controller: "partsHistroyCtrl"
            })
            .when("/machine/view/details", {
                templateUrl: "template/view-machine.html",
                controller: "viewMachineCtrl"
            })

    $locationProvider.html5Mode(true);
    blockUIConfig.autoBlock = false;
}).run(function ($rootScope, common) {
    if (common.getAuthKey()) {
        common.doInit();
        //console.log("initialized");
    }
    if ($.cookie('viewType')) {
        $.removeCookie("viewType");
    }
});
// function to disable the keypress event for other than numbers
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function RestrictSpace() {
    if (event.keyCode == 32) {
        return false;
    }
}
// $( document ).ready(function() {
//     console.log( "ready!" );
// });
// angular.element(document).ready(function () {
//     var $injector = angular.bootstrap(document, ['myApp']);
//     var $service = $injector.get('$service');
//     var serviceCommon = $service('common');
//     serviceCommon.doInit();
//     console.log("ready.!!");
// });
app.factory('Scopes', function ($rootScope) {
    var mem = {};

    return {
        store: function (key, value) {
            $rootScope.$emit('scope.stored', key);
            mem[key] = value;
        },
        get: function (key) {
            return mem[key];
        }
    };
});

