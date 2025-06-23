$(document).ready(function () {
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
            history.replaceState('', '', `http://localhost/Grading-Management-System-main/gms-faculty/main/?url=${page}`)
            loadContent();
        }
    });

    function loadContent() {
        $(".nav-link").removeClass('active-nav');
        $("#" + searchParams.get('url')).addClass('active-nav');
        $("#content").load("../" + searchParams.get('url'));
    }
});
