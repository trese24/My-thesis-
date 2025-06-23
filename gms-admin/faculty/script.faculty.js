$(document).ready(function () {
    displayFaculties();
    displayBlockedFaculty();
    $("#uploadFileBtn").click(function (e) {
        e.preventDefault();
        $("#fileUpload").trigger('click');
    });

    $("#fileUpload").change(function (e) {
        e.preventDefault();
        $("#fileUploadForm").submit();
    });

    $("#addFacultyModal").on("show.bs.modal", function () {
        let subCtr = 1;
        $("#add-subject").click(function (e) {
            e.preventDefault();
            subCtr++;
            let sub = `
            <div class="row g-2">
                <div class="col-4">
                    <div class="mb-3">
                        <label for="add-subject-${subCtr}" class="form-label">Subject Code</label>
                        <select class="form-select mb-3" name="subject[${subCtr}]" id="add-subject-${subCtr}" required>
                                    <option value="General" selected>CAP 301</option>
                                    <option value="Business Analytics">CAP 401</option>
                                    <option value="Web Development">IT 104</option>
                                    <option value="Service Management">IT 103</option>
                                    <option value="Service Management">IT 102</option>
                                    <option value="Service Management">NSTP 1</option>
                                    </select>
                    </div>
                </div>
                <div class="col-8">
                    <div class="mb-3">
                        <label for="add-sections-${subCtr}" class="form-label">Class Sections</label>
                        <input type="text" class="form-control" name="sections[${subCtr}]" id="add-sections-${subCtr}">
                    </div>
                </div>
            </div>`;
            $("#add-facultySubjects").append(sub);
            $("#subCtr").val(subCtr);
        });

    });

    function displayBlockedFaculty() {
        $.ajax({
            type: "POST",
            url: "../faculty/process.faculty.php",
            data: { GET_BLOCKED_FACULTY_REQ: true },
            dataType: "JSON",
            success: function (GET_BLOCKED_FACULTY_RESP) {
                content = ``;
                $.each(GET_BLOCKED_FACULTY_RESP, function (indexInArray, faculty) {
                    content += `
                        <tr">
                            <td>${faculty.id}</td>
                            <td>${faculty.fullName}</td>
                            <td>${faculty.email}</td>
                            <td>${faculty.contact_no}</td>
                            <td><button type="button" class="btn btn-dark btn-sm unblock" data-id="${faculty.id}">Unblock</button></td>
                        </tr>
                     `;
                });
                $("#blockedFacultyRecor`ds").html(content);
                if ($.fn.DataTable.isDataTable("#blockedFacultiesTable")) {
                    $('#blockedFacultiesTable').DataTable().clear().destroy();
                }
                $("#blockedFacultiesTable").DataTable();
                $(".unblock").click(function (e) {
                    e.preventDefault();
                    var id = $(this).data("id");
                    $.ajax({
                        type: "POST",
                        url: "../faculty/process.faculty.php",
                        data: { UNBLOCK_FACULTY_REQ: id },
                        dataType: "JSON",
                        success: function (UNBLOCK_FACULTY_RESP) {
                            if (UNBLOCK_FACULTY_RESP.status) {
                                $(".toast-body").html(id + " has been successfully unblocked")
                                $("#liveToast").toast("show");
                                displayBlockedFaculty();
                                displayFaculties();
                            } else {
                                console.error(UNBLOCK_FACULTY_RESP.msg);
                            }
                        }
                    });
                });
            }
        });
    }

    function displayFaculties() {
        $.ajax({
            type: "POST",
            url: "../faculty/process.faculty.php",
            data: { GET_FACULTIES_REQ: true },
            dataType: "JSON",
            success: function (GET_FACULTIES_RESP) {
                content = ``;
                $.each(GET_FACULTIES_RESP, function (indexInArray, faculty) {
                    content += `
                        <tr data-id="${faculty.facultyID}">
                            <td>${faculty.facultyID}</td>
                            <td>${faculty.fullName}</td>
                            <td>${faculty.email}</td>
                            <td>${faculty.contact_no}</td>
                        </tr>
                     `;
                });

                if ($.fn.DataTable.isDataTable("#facultiesTable")) {
                    $('#facultiesTable').DataTable().clear().destroy();
                }
                $("#facultyRecords").html(content);
                $("#facultiesTable").DataTable({
                    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
                    "pageLength": 10
                });

                var selectedFaculty = "";
                $("#facultyRecords > tr").click(function (e) {
                    e.preventDefault();
                    facultyID = $(this).data("id");
                    selectedFaculty = GET_FACULTIES_RESP.filter(function (eachFaculty) {
                        return eachFaculty.facultyID == facultyID;
                    })[0];
                    $("#view-profile").attr("src", "../../" + selectedFaculty.profile_picture);
                    $("#view-facultyID").html(selectedFaculty.facultyID);
                    $("#view-fullName").html(selectedFaculty.fullName);
                    $("#view-email").html(selectedFaculty.email);
                    $("#view-contactNo").html(selectedFaculty.contact_no);
                    let subjects = ``;
                    $.each(selectedFaculty.sub_sec, function (indexInArray, subject) {
                        subjects += `
                            <tr>
                                <td>${subject.code}</td>
                                <td>${subject.description}</td>
                                <td>${subject.sections}</td>
                            </tr>`;
                    });
                    $("#view-subjects").html(subjects);
                    $("#viewFacultyModal").modal("show");

                    $("#removeFacultyModal").on("show.bs.modal", function () {
                        $("#remove-fullName").html(selectedFaculty.fullName);
                        $("#remove-facultyID").html(selectedFaculty.facultyID);
                    })

                    $("#remove-yes-btn").click(function (e) {
                        e.preventDefault();
                        $.ajax({
                            type: "POST",
                            url: "../faculty/process.faculty.php",
                            data: { REMOVE_FACULTY_REQ: selectedFaculty.facultyID },
                            dataType: "JSON",
                            success: function (REMOVE_FACULTY_RESP) {
                                console.log(REMOVE_FACULTY_RESP);
                                displayFaculties();
                                $("#removeFacultyModal").modal("hide");
                            }
                        });
                    });
                });

                $("#editFacultyModal").on("show.bs.modal", function () {
                    $("#edit-oldFacultyID").val(selectedFaculty.facultyID);
                    $("#edit-facultyID").val(selectedFaculty.facultyID);
                    $("#edit-fullName").val(selectedFaculty.fullName);
                    $("#edit-email").val(selectedFaculty.email);
                    $("#edit-contactNo").val(selectedFaculty.contact_no);

                    let sub_sec = ``;
                    let subCtr = 0;
                    $.each(selectedFaculty.sub_sec, function (i, subject) {
                        subCtr++;
                        sub_sec += `
                        <div class="row g-2" id="sub${subCtr}">
                            <div class="col-4">
                                <div class="mb-3">
                                    <label for="edit-subject-${i + 1}" class="form-label">Subject</label>
                                    <input type="text" class="form-control" name="edit-subject[${i + 1}]" id="edit-subject-${i + 1}" value="${subject.code}">
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="mb-3">
                                    <label for="edit-sections-${i + 1}" class="form-label">Class Sections</label>
                                    <input type="text" class="form-control" name="edit-sections[${i + 1}]" id="edit-sections-${i + 1}" value="${subject.sections}">
                                </div>
                            </div>
                            <div class="col-1">
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-sm removeSubject" data-index="${subCtr}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                        </div>`;
                    });
                    $("#edit-subCtr").val(selectedFaculty.sub_sec.length);
                    $("#edit-facultySubjects").html(sub_sec);
                    $(".removeSubject").click(function (e) {
                        e.preventDefault();
                        var id = $(this).data("index");
                        subCtr--;
                        $("#sub" + id).remove();
                        $("#edit-subCtr").val(subCtr);
                    });

                    $("#edit-subject").click(function (e) {
                        e.preventDefault();
                        subCtr++;
                        let sub = `
                            <div class="row g-2" id="sub${subCtr}">
                                <div class="col-4">
                                    <div class="mb-3">
                                    <label for="edit-subject-${subCtr}" class="form-label">Subject Code</label>
                                    <input type="text" class="form-control" name="edit-subject[${subCtr}]" id="edit-subject-${subCtr}">
                                    </div>
                                </div>
                                <div class="col-7">
                                    <div class="mb-3">
                                        <label for="edit-sections-${subCtr}" class="form-label">Class Sections</label>
                                        <input type="text" class="form-control" name="edit-sections[${subCtr}]" id="edit-sections-${subCtr}">
                                    </div>
                                </div>
                                <div class="col-1">
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-sm removeSubject" data-index="${subCtr}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>`;
                        $("#edit-facultySubjects").append(sub);
                        $("#edit-subCtr").val(subCtr);
                        $(".removeSubject").click(function (e) {
                            e.preventDefault();
                            var id = $(this).data("index");
                            subCtr--;
                            $("#sub" + id).remove();
                            $("#edit-subCtr").val(subCtr);
                        });
                    });
                });
                $("#loadingScreen").modal("hide");
            }, error: function (response) {
                console.error(response);
                $("#error").html(response.responseText);
            },
            beforeSend: function (response) {
                $("#loadingScreen").modal("show");
            }
        });


    }

    var tempData = {};
    $("#fileUploadForm").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: '../faculty/process.faculty.php',
            type: 'POST',
            data: new FormData(this),
            contentType: false,
            cache: false,
            processData: false,
            dataType: 'json',
            success: function (data) {
                var content = `
                <div class="table-responsive">
                    <table id="previewTable" class="table table-sm table-striped table-bordered display compact">
                        <thead><tr>
                        `;
                tempData.body = [];
                $.each(data, function (indexInArray, valueOfElement) {
                    if (indexInArray == 0) {
                        tempData.headers = [];
                        $.each(valueOfElement, function (i, val) {
                            content += `<th>` + val + `</th>`;
                            tempData.headers.push(val);
                        });
                        content += `</tr></thead><tbody>`;
                        return;
                    }
                    content += `<tr>`;
                    var v = [];
                    $.each(valueOfElement, function (i, val) {
                        content += `<td>` + val + `</td>`;
                        v.push(val);
                    });
                    tempData.body.push(v);
                    content += `</tr>`;
                });
                content += `</tbody></table>`;

                $("#fileUploadModal").modal("show");
                $("#previewSpinner").fadeOut();
                $("#fileUploadBody").html(content);
                mergeCommonRows($("#previewTable"))
                // $('#previewTable').DataTable();
            }, error: function (dataResult) {
                console.error(dataResult);
                $("#fileUploadBody").prepend(dataResult.responseText);
            }, beforeSend: function () {
                $("#fileUploadModal").modal("show");
                $("#previewSpinner").show();
            }
        });

    });

    function mergeCommonRows(table, firstOnly) {
        reset(table);
        var firstColumnBrakes = [];
        for (var i = 1; i <= table.find('th').length; i++) {
            var previous = null, cellToExtend = null, rowspan = 1;
            table.find("td:nth-child(" + i + ")").each(function (index, el) {
                if (previous == $(el).text() && $(el).text() !== "" && $.inArray(index, firstColumnBrakes) === -1) {
                    $(el).addClass('d-none');
                    cellToExtend.attr("rowspan", (rowspan = rowspan + 1));
                    cellToExtend.addClass("align-middle");
                } else {
                    if (firstOnly == 'first only') {
                        if (i === 1) firstColumnBrakes.push(index);
                    } else {
                        if ($.inArray(index, firstColumnBrakes) === -1) firstColumnBrakes.push(index);
                    }
                    rowspan = 1;
                    previous = $(el).text();
                    cellToExtend = $(el);
                }
            });
        }
    }
    function reset(table) {
        table.find('td').removeClass('d-none').attr('rowspan', 1);
    }


    $("#uploadSpinner").hide();
    $("#upload").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: '../faculty/process.faculty.php',
            type: 'POST',
            data: { uploadFileToDB: tempData },
            dataType: 'json',
            success: function (data) {
                console.log(data);
                var flag = true;
                $.each(data, function (indexInArray, valueOfElement) {
                    if (!valueOfElement.status) {
                        flag = false;
                        $("#uploadSpinner").hide();
                        $("#fileUploadForm").trigger('reset');
                        var content = `
                        <div class="alert alert-danger alert-dismissible fade show mb-2" role="alert">`+ valueOfElement.msg + `
                        <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        $("#fileUploadBody").prepend(content);
                    }
                });
                if (flag) {
                    $("#fileUploadModal").modal("hide");
                    $("#updloadLabel").html("Upload");
                    $("#upload").removeAttr("disabled");
                    $("#uploadSpinner").hide();
                    $("#fileUploadBody").html('');
                    $("#fileUploadForm").trigger('reset');
                    displayFaculties();
                }

            }, error: function (dataResult) {
                console.log("ERROR:");
                console.log(dataResult.responseText);
                $("#fileUploadBody").prepend(dataResult.responseText);
                $("#updloadLabel").html("Upload");
                $("#upload").removeAttr("disabled");
                $("#uploadSpinner").hide();
                $("#fileUploadForm").trigger('reset');
                var content = `
                <div class="alert alert-danger alert-dismissible fade show mb-2" role="alert">
                We encounter problem. Some faculty may not be receive email from the system or didn't register to the system.
                <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
                $("#fileUploadBody").prepend(content);
            }, beforeSend: function () {
                $("#uploadSpinner").show();
                $("#updloadLabel").html("Uploading");
                $("#upload").attr("disabled", "disabled");
            }
        });
    });

    $("#addNewFacultyError").hide();
    $("#addFacultySpinner").hide();
    $("#addFacultyForm").submit(function (e) {
        e.preventDefault();
        var data = $(this).serializeArray();  // Form Data
        data.push({ name: 'ADD_FACULTY_REQ', value: true });
        $.ajax({
            type: "POST",
            url: "../faculty/process.faculty.php",
            data: data,
            dataType: "json",
            success: function (ADD_FACULTY_RESP) {
                $("#addLabel").html("Add New Faculty");
                $("#addFacultyBtn").removeAttr("disabled");
                $("#addFacultySpinner").hide();

                if (ADD_FACULTY_RESP.status) {
                    $("#addNewFacultyError").fadeOut();
                    $("#addFacultyForm").trigger('reset');
                    $("#addFacultyModal").modal("hide");
                } else {
                    console.error(ADD_FACULTY_RESP);
                    if (ADD_FACULTY_RESP.msg.toLowerCase().includes("duplicate entry")) {
                        $("#addNewFacultyError").html("The faculty ID has already been assigned.");
                        $("#addNewFacultyError").fadeIn();
                    } else {
                        $("#addNewFacultyError").html(ADD_FACULTY_RESP.msg);
                        $("#addNewFacultyError").fadeIn();
                    }
                }
                displayFaculties();
            },
            beforeSend: function () {
                $("#addLabel").html("Adding New Faculty");
                $("#addFacultySpinner").show();
                $("#addFacultyBtn").attr("disabled", "disabled");
            },
            error: function (response) {
                var errorMsg = response.responseText;
                console.error(errorMsg);
                $("#addLabel").html("Add New Faculty");
                $("#addFacultyBtn").removeAttr("disabled");
                $("#addFacultySpinner").hide();
                if (errorMsg.toLowerCase().includes("uq_faculty_subject")) {
                    $("#addNewFacultyError").html("The subject and section has already been assigned to other faculty");
                    $("#addNewFacultyError").fadeIn();
                } else {
                    $("#addNewFacultyError").html(response.responseText);
                    $("#addNewFacultyError").fadeIn();
                }
            }
        });
    });

    $("#editFacultyModal").on("show.bs.modal", function () {
        $("#editNewFacultyError").hide();
    })

    $("#editFacultyForm").submit(function (e) {
        e.preventDefault();
        var data = $(this).serializeArray();  // Form Data
        data.push({ name: 'EDIT_FACULTY_REQ', value: true });
        $.ajax({
            type: "POST",
            url: "../faculty/process.faculty.php",
            data: data,
            dataType: "json",
            success: function (EDIT_FACULTY_RESP) {
                if (EDIT_FACULTY_RESP.status) {
                    $("#editNewFacultyError").fadeOut();
                    $("#editFacultyForm").trigger('reset');
                    $("#editFacultyModal").modal("hide");
                    displayFaculties();
                } else {
                    var msg = EDIT_FACULTY_RESP.msg;
                    if (msg.toLowerCase().includes("uq_faculty_subject")) {
                        var i = msg.indexOf('\'') + 1;
                        var x = msg.indexOf('\'', i);
                        $("#editNewFacultyError").html("The " + msg.substring(i, x) + " has already been assigned");
                        $("#editNewFacultyError").fadeIn();
                    } else if (msg.toLowerCase().includes("duplicate entry")) {
                        $("#editNewFacultyError").html("The faculty ID has already been assigned.");
                        $("#editNewFacultyError").fadeIn();
                    }

                }
            },
            error: function (response) {
                console.error(response);
                $("#editNewFacultyError").html(response.responseText);
                $("#editNewFacultyError").fadeIn();
            }
        });
    });

});
