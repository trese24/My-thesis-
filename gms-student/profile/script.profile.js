$(document).ready(function () {
    $("#pass").on("show.bs.collapse", function () {
        $("#confirmPassword").removeAttr("disabled");
        $("#newPassword").removeAttr("disabled");
    });

    $("#pass").on("hidden.bs.collapse", function () {
        $("#newPassword").attr("disabled", "disabled");
        $("#confirmPassword").attr("disabled", "disabled");
    });

    $('#changeProfileBtn').change(function () {
        var file = $("#changeProfileBtn").get(0).files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function () {
                console.log(reader.result);
                $("#profile_picture").attr("src", reader.result);
            }
            reader.readAsDataURL(file);
        }
    });

    $.ajax({
        type: "POST",
        url: "../profile/process.profile.php",
        data: { GET_STUDENT_REQ: true },
        dataType: "JSON",
        success: function (GET_STUDENT_RESP) {
            console.log(GET_STUDENT_RESP);
            $("#studentNo").val(GET_STUDENT_RESP.studentNo);
            $("#fullName").val(GET_STUDENT_RESP.fullName);
            $("#gender").val(GET_STUDENT_RESP.gender);
            $("#program").val(GET_STUDENT_RESP.program);
            $("#specialization").val(GET_STUDENT_RESP.specialization);
            $("#level").val(GET_STUDENT_RESP.level);
            $("#section").val(GET_STUDENT_RESP.section);
            $("#email").val(GET_STUDENT_RESP.email);
            $("#contactNo").val(GET_STUDENT_RESP.contact_no);
            $("#username").val(GET_STUDENT_RESP.username);
            $("#profile_picture").attr("src", "../../"+GET_STUDENT_RESP.profile_picture);
            $("#old_profile").val(GET_STUDENT_RESP.profile_picture);
        }, error: function (response) {
            console.error(response.responseText);
            $("#error").html(response.responseText);
        }
    });

    $("#profileForm").submit(function (e) {
        e.preventDefault();
        var data = new FormData(this);
        data.append("UPDATE_STUDENT_REQ", true);
        // console.log(data);
        $.ajax({
            type: "POST",
            url: "../profile/process.profile.php",
            data: data,
            contentType: false,
            cache: false,
            processData: false,
            dataType: "JSON",
            success: function (UPDATE_STUDENT_RESP) {
                console.log(UPDATE_STUDENT_RESP);
                if (UPDATE_STUDENT_RESP.status) {
                    $("#successAlert").removeClass("d-none");
                    $("#errorAlert").addClass("d-none");
                    $("#pass").collapse("hide");
                } else {
                    $("#errorAlert").html(UPDATE_STUDENT_RESP.msg);
                    $("#successAlert").addClass("d-none");
                    $("#errorAlert").removeClass("d-none");
                }
            }, error: function (response) {
                console.log(response);
                $("#error").html(response.responseText);
                $("#error").removeClass("d-none");
            }
        });
    });
});
