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
        data: { GET_FACULTY_REQ: true },
        dataType: "JSON",
        success: function (GET_FACULTY_RESP) {
            console.log(GET_FACULTY_RESP);
            $("#empID").html(GET_FACULTY_RESP.facultyID);
            $("#fullName").val(GET_FACULTY_RESP.fullName);
            $("#email").val(GET_FACULTY_RESP.email);
            $("#contactNo").val(GET_FACULTY_RESP.contact_no);
            $("#username").val(GET_FACULTY_RESP.username);
            $("#profile_picture").attr("src", "../../"+GET_FACULTY_RESP.profile_picture);
            $("#old_profile").val(GET_FACULTY_RESP.profile_picture);
        }, error: function (response) {
            console.log(response.responseText);
            $("#error").html(response.responseText);
        }
    });

    $("#profileForm").submit(function (e) {
        e.preventDefault();
        var data = new FormData(this);
        data.append("UPDATE_FACULTY_REQ", true);
        $.ajax({
            type: "POST",
            url: "../profile/process.profile.php",
            data: data,
            contentType: false,
            cache: false,
            processData: false,
            dataType: "JSON",
            success: function (UPDATE_FACULTY_RESP) {
                console.log(UPDATE_FACULTY_RESP);
                if (UPDATE_FACULTY_RESP.status) {
                    $("#successAlert").removeClass("d-none");
                    $("#errorAlert").addClass("d-none");
                    $("#pass").collapse("hide");
                } else {
                    $("#errorAlert").html(UPDATE_FACULTY_RESP.msg);
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
