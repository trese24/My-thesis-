$(document).ready(function () {
    $("#alertSuccess").hide();
    $("#alertError").hide();

    var criteria = [];
    $.ajax({
        type: "POST",
        url: "../criteria/process.criteria.php",
        data: { GET_CRITERIA_REQ: true },
        dataType: "JSON",
        success: function (GET_CRITERIA_RESP) {
            $.each(GET_CRITERIA_RESP, function (i, data) {
                criteria.push({ label: data.name, percentage: data.equiv });
            });

            displayCriteria();
            $("#loadingScreen").modal("hide");
        }, beforeSend: function () {
            $("#loadingScreen").modal("show");
        }, error: function (response) {
            console.error(response);
        }
    });

    function displayCriteria() {
        content = ``;
        $.each(criteria, function (i, data) {
            content += `
            <div class="col-7">
                <input type="text" class="form-control criteriaLabel" name="cname${i}" data-index="${i}" value="${data.label}">
            </div>
            <div class="col-4">
                <div class="input-group">
                    <input type="number" class="form-control criteriaVal" min="0" name="cval${i}" data-index="${i}" value="${data.percentage}">
                    <span class="input-group-text" id="basic-addon1">%</span>
                </div>
            </div>
            <div class="col-1">
                <button type="button" class="btn removeBtn" data-index="${i}" data-name="${data.label}"><i class="fas fa-trash"></i></button>
            </div>
            `;
        });
        $("#listOfCriteria").html(content);

        $(".removeBtn").click(function (e) {
            e.preventDefault();
            var id = $(this).data("index");
            var name = $(this).data("name");
            $(".removeName").html(name);
            $("#remove-yes-btn").data("index", id);
            $("#confirmationModal").modal("show");
        });
        $(".criteriaLabel").change(function (e) {
            e.preventDefault();
            var index = $(this).data("index");
            criteria[index].label = $(this).val();
        });
        $(".criteriaVal").change(function (e) {
            e.preventDefault();
            var index = $(this).data("index");
            criteria[index].percentage = $(this).val();
        });
    }

    $("#addCriteria").click(function (e) {
        e.preventDefault();
        criteria.push({ label: "", percentage: 0 });
        displayCriteria();
    });

    $("#remove-yes-btn").click(function (e) {
        e.preventDefault();
        var index = $(this).data("index");
        criteria.splice(index);
        displayCriteria();
        $("#confirmationModal").modal("hide");
    });


    $("#saveBtn").click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "../criteria/process.criteria.php",
            data: { UPDATE_CRITERIA_REQ: true, criteria: criteria },
            dataType: "JSON",
            success: function (UPDATE_CRITERIA_RESP) {
                displayCriteria();
                $("#alertSuccess").show();
                setTimeout(() => { $("#alertSuccess").hide() }, 3000)
            }, error: function (response) {
                console.error(response);
                $("#error").html(response.responseText);
            }
        });
    });
});
