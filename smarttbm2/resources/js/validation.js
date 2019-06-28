function validateChangePasswordForm(){
    $.validator.addMethod("alphanumeric", function(value, element) {
                return this.optional(element) || value == value.match( /^[a-zA-Z0-9\-\s]+$/);
            }, "Invalid Input");

    $.validator.addMethod("checkBlankspaces", function(value, element) {
                var space = false;
                if (value.replace(/^\s+|\s+$/g, "").length != 0){
                     space = true;
                }
                return space;
            }, "Invalid Input");

    var str = $("input").val();

	$("#changePasswordForm").validate({
                            rules: {
                                username: {
                                    required: true,
                                },
                                oldpassword: {
                                    required: true,
                                    //checkBlankspaces: true,
                                },
                                newpassword: {
                                    required: true,
                                     minlength: 5,
                                     checkBlankspaces: true,
                                },
                                confirmpassword: {
                                	minlength: 5,
                                    equalTo: "#newpassword",
                                    checkBlankspaces: true,
                                }
                            },
                        });
    $("#login-form").validate({
                            rules: {
                                username: {
                                    required: true,
                                    alphanumeric: true,
                                },
                                password: {
                                    required: true,
                                },
                            },
                        });
}

function validateConfigureSenderEmailForm(){
   /* $.validator.addMethod("alphanumeric", function(value, element) {
                return this.optional(element) || value == value.match( /^[a-zA-Z0-9\-\s]+$/);
            }, "Invalid Input");*/
           
    $("#configureSenderEmailForm").validate({
        rules: {
            host: {
                required: true,
            },
            port: {
                required: true,
            },
            senderEmail_id: {
                required: true,
            },
            senderPassword: {
                required: true,
            },
            mail_to: {
                required: true,
            },
            mail_body: {
                required: true,
            },
        },
    });  
    // $("#testSenderEmailForm").validate({
        

    // });          
}
