$(document).ready(function () {
    // CHECK IF SESSION[DEPTHEAD] is set
    $.post("process.main.php", function (data, textStatus, jqXHR) {
        if (data) {
            window.location.href = '../';
        }
    });

    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('url')) {
        loadContent();
    }

    $(".nav-link").click(function (e) {
        e.preventDefault();
        if (searchParams.has('url')) {
            let page = $(this).attr('id');
            searchParams.set('url', page);
            history.replaceState('', '', `http://localhost/Grading-Management-System-main/gms-depthead/main/?url=${page}`)
            loadContent();
        }
    });

    function loadContent() {
        $(".nav-link").removeClass('active-nav');
        $("#" + searchParams.get('url')).addClass('active-nav');
        $("#content").load("../" + searchParams.get('url'));
    }

    $("#pass").on("show.bs.collapse", function () {
        $("#confirmPassword").removeAttr("disabled");
        $("#newPassword").removeAttr("disabled");
    });

    $("#pass").on("hidden.bs.collapse", function () {
        $("#newPassword").attr("disabled", "disabled");
        $("#confirmPassword").attr("disabled", "disabled");
    });


    $("#updateProfileModal").on("show.bs.modal", function () {
        $("#profileForm").trigger("reset");
        $("#errorAlert").hide();
        $.ajax({
            type: "POST",
            url: "process.main.php",
            data: { getInfo: true },
            dataType: "JSON",
            success: function (data) {
                $("#username").val(data.username);
                $("#email").val(data.email);
            },
            error: function (response) {
                console.log(response.responseText);
            }
        });
    });

    $("#profileForm").submit(function (event) {
        event.preventDefault();
        var data = $(this).serializeArray();
        data.push({ name: 'setInfo', value: true });
        $.ajax({
            type: "POST",
            url: "process.main.php",
            data: data,
            dataType: "JSON",
            success: function (response) {
                console.log(response);
                if (response.status) {
                    $("#updateProfileModal").modal('hide');
                } else {
                    $("#errorAlert").html(response.msg);
                    $("#errorAlert").fadeIn();
                }
            },
            error: function (response) {
                console.log(response.responseText);
            }
        });
    });
});
