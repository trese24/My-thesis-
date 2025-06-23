$(document).ready(function () {
    displayStudents();
    displayBlockedStudent();
    $("#uploadFileBtn").click(function (e) {
        e.preventDefault();
        $("#fileUpload").trigger('click');
    });

    $("#fileUpload").change(function (e) {
        e.preventDefault();
        $("#fileUploadForm").submit();
    });

    $.post("../student/process.student.php", { GET_PROGRAM_DESTINCT_REQ: true },
        function (GET_PROGRAM_DESTINCT_RESP, textStatus, jqXHR) {
            let content = `<option value="All" selected>All</option>`;
            $.each(GET_PROGRAM_DESTINCT_RESP, function (indexInArray, program) {
                content += `<option value="${program}">${program}</option>`;
            });
            $("#filter-program").html(content);
        },
        "JSON"
    );

    getSectionsFilter();

    function getSectionsFilter() {
        $.post("../student/process.student.php", {
            GET_SECTION_DESTINCT_REQ: true,
            level: $("#filter-level").val()
        },
            function (GET_SECTION_DESTINCT_RESP, textStatus, jqXHR) {
                let content = `<option value="All" selected>All</option>`;
                $.each(GET_SECTION_DESTINCT_RESP, function (indexInArray, section) {
                    content += `<option value="${section}">${section}</option>`;
                });
                $("#filter-section").html(content);
            },
            "JSON"
        );
    }

    $("#promote").click(function (e) {
        e.preventDefault();
        console.log("promote");
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { PROMOTE_YEAR_LEVEL_REQ: true },
            dataType: "JSON",
            success: function (response) {
                displayStudents();
                $("#loadingScreen").modal("hide");
            }, error: function (response) {
                console.error(response);
            },
            beforeSend: function (response) {
                $("#loadingScreen").modal("show");
            }
        });
    });

    $("#demote").click(function (e) {
        e.preventDefault();
        console.log("promote");
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { DEMOTE_YEAR_LEVEL_REQ: true },
            dataType: "JSON",
            success: function (response) {
                displayStudents();
                $("#loadingScreen").modal("hide");
            }, error: function (response) {
                console.error(response);
            },
            beforeSend: function (response) {
                $("#loadingScreen").modal("show");
            }
        });
    });

    $("#filter-level").change(function (e) {
        e.preventDefault();
        getSectionsFilter();
        displayStudents($("#filter-level").val(), $("#filter-section").val());
    });

    $("#filter-section").change(function (e) {
        e.preventDefault();
        displayStudents($("#filter-level").val(), $("#filter-section").val());
    });

    $.ajax({
        type: "POST",
        url: "../student/process.student.php",
        data: { GET_ALUMNI_STUDENT_REQ: true },
        dataType: "JSON",
        success: function (GET_ALUMNI_STUDENT_RESP) {
            content = ``;
            $.each(GET_ALUMNI_STUDENT_RESP, function (indexInArray, student) {
                content += `
                    <tr data-id="${student.studentNo}">
                        <td>${student.studentNo}</td>
                        <td>${student.fullName}</td>
                        <td>${student.program} ${student.section}</td>
                        <td>${student.specialization}</td>
                        <td>${student.email}</td>
                        <td>${student.contact_no}</td>
                    </tr>
                 `;
            });
            $("#alumniStudentRecords").html(content);
            $("#alumniSpinner").hide();
            $("#alumniStudentsTable").DataTable();
            viewStudentDetails(GET_ALUMNI_STUDENT_RESP);
        }
    });

    function displayBlockedStudent() {
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { GET_BLOCKED_STUDENT_REQ: true },
            dataType: "JSON",
            success: function (GET_BLOCKED_STUDENT_RESP) {
                content = ``;
                $.each(GET_BLOCKED_STUDENT_RESP, function (indexInArray, student) {
                    content += `
                        <tr>
                            <td>${student.studentNo}</td>
                            <td>${student.fullName}</td>
                            <td>${student.program} ${student.section}</td>
                            <td>${student.specialization}</td>
                            <td>${student.email}</td>
                            <td>${student.contact_no}</td>
                            <td><button type="button" class="btn btn-dark btn-sm unblock" data-id="${student.studentNo}">Unblock</button></td>
                        </tr>
                     `;
                });
                $("#blockedStudentRecords").html(content);
                if ($.fn.DataTable.isDataTable("#blockedStudentsTable")) {
                    $('#blockedStudentsTable').DataTable().clear().destroy();
                }
                $("#blockedStudentsTable").DataTable();
                $(".unblock").click(function (e) {
                    e.preventDefault();
                    var id = $(this).data("id");
                    $.ajax({
                        type: "POST",
                        url: "../student/process.student.php",
                        data: { UNBLOCK_STUDENT_REQ: id },
                        dataType: "JSON",
                        success: function (UNBLOCK_STUDENT_RESP) {
                            if (UNBLOCK_STUDENT_RESP.status) {
                                $(".toast-body").html(id + " has been successfully unblocked")
                                $("#liveToast").toast("show");
                                displayBlockedStudent();
                                displayStudents();
                            } else {
                                console.error(UNBLOCK_STUDENT_RESP.msg);
                            }
                        }
                    });
                });
            }
        });
    }

    function displayStudents(level = 'All', section = 'All') {
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { GET_STUDENTS_REQ: true },
            dataType: "JSON",
            success: function (GET_STUDENTS_RESP) {
                var filtered = GET_STUDENTS_RESP.filter(function (student) {
                    // let spec = (specialization == "All") ? true : student.specialization == specialization;
                    // let prog = (program == "All") ? true : student.program == program;
                    let lev = (level == "All") ? true : student.level.toUpperCase() == level;
                    let sec = (section == "All") ? true : student.section == section;

                    return lev && sec;
                });
                content = ``;
                $.each(filtered, function (indexInArray, student) {
                    content += `
                        <tr data-id="${student.studentNo}">
                            <td>${student.studentNo}</td>
                            <td>${student.fullName}</td>
                            <td>${student.program} ${student.section}</td>
                            <td>${student.specialization}</td>
                            <td>${student.email}</td>
                            <td>${student.contact_no}</td>
                        </tr>
                     `;
                });

                if ($.fn.DataTable.isDataTable("#studentsTable")) {
                    $('#studentsTable').DataTable().clear().destroy();
                }
                $("#studentRecords").html(content);
                $("#studentsTable").DataTable({
                    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
                    "pageLength": 10
                });

                viewStudentDetails(GET_STUDENTS_RESP);

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

    function viewStudentDetails(studentList) {
        var selectedStudent = "";
        $("#studentRecords > tr, #alumniStudentRecords > tr").click(function (e) {
            e.preventDefault();
            $("#gradesAccordion").html("");
            studentNo = $(this).data("id");
            selectedStudent = studentList.filter(function (eachStudent) {
                return eachStudent.studentNo == studentNo;
            })[0];
            console.log(selectedStudent);
            $("#view-profile").attr("src", selectedStudent.profile_picture);
            $("#view-studentNo").html(selectedStudent.studentNo);
            $("#view-fullName").html(selectedStudent.fullName);
            $("#view-cys").html(selectedStudent.program + " " + selectedStudent.section);
            $("#view-email").html(selectedStudent.email);
            $("#view-contactNo").html(selectedStudent.contact_no);
            $("#view-gender").html(selectedStudent.gender);
            $("#view-specialization").html(selectedStudent.specialization);
            $("#view-program").html(selectedStudent.program);
            $("#view-level").html(selectedStudent.level);
            $("#view-section").html(selectedStudent.section);

            $("#year_sem").change(function (e) {
                e.preventDefault();
                var year_sem = $(this).val();
                var year = year_sem.split('-')[0];
                var sem = year_sem.split('-')[1];
                var filtered = keepCloning(temp_subject);
                filtered.subjects = filtered.subjects.filter(function (data) {
                    return data.level == year && data.semester == sem;
                });
                displayStudentGrades(filtered);
            });

            var temp_subject = {};
            $.ajax({
                type: "POST",
                url: "../student/process.student.php",
                data: { GET_STUDENT_GRADES_REQ: studentNo },
                dataType: "JSON",
                success: function (GET_STUDENT_GRADES_RESP) {
                    temp_subject = keepCloning(GET_STUDENT_GRADES_RESP);
                    var year_sem = $("#year_sem").val();
                    var year = year_sem.split('-')[0];
                    var sem = year_sem.split('-')[1];
                    var filtered = keepCloning(temp_subject);
                    filtered.subjects = filtered.subjects.filter(function (data) {
                        return data.level == year && data.semester == sem;
                    });
                    displayStudentGrades(filtered);
                    $("#gradeSpinner").addClass("d-none");
                }, error: function (response) {
                    console.error(response);
                    // $("#error").html(response.responseText);
                }, beforeSend: function (response) {
                    $("#gradeSpinner").removeClass("d-none");
                }
            });

            function displayStudentGrades(temp_subject) {
                var accordionContent = ``;
                var grades = [];
                $.each(temp_subject.subjects, function (subjectIndex, subject) {
                    grades.push(subject.grade);

                    // * SETUP SUBJECT CRITERIA
                    let colGroup = ``;
                    let criteria_th = ``;
                    let activities_th = ``;
                    let lockBtn_th = ``;
                    let score_th = ``;
                    $.each(subject.criteria, function (criteriaIndex, criteria) {
                        let criteriaLength = criteria.activities.length;
                        colGroup += `<col span="${criteriaLength}">
                                <col style="background-color: #ffe5d0;">`;
                        criteria_th += `<th colspan="${criteriaLength + 1}">${criteria.name}</th>`;
                        $.each(criteria.activities, function (i, activity) {
                            activity.isLock = (String(activity.isLock) === 'true');
                            if (criteriaLength - 1 != i) {
                                lockBtn_th += `<th data-criteria="${criteriaIndex}" data-act="${i}" class="lock-btn bg-light ${activity.isLock ? 'active' : ''}">
                                    <i class="fas ${activity.isLock ? 'fa-lock' : 'fa-unlock-alt'}"></i></th>`;
                                activities_th += `<th>${activity.name}</th>`;
                                score_th += `<th>${activity.total}</th>`;
                            } else {
                                lockBtn_th += `<th data-criteria="${criteriaIndex}" data-act="${i}" class="lock-btn bg-light ${activity.isLock ? 'active' : ''}">
                                    <i class="fas ${activity.isLock ? 'fa-lock' : 'fa-unlock-alt'}"></i></th>`;
                                lockBtn_th += `<th rowspan='2'>Equiv</th>`;
                                activities_th += `
                                <th>${activity.name}</th>`;
                                score_th += `
                                    <th>${activity.total}</th>
                                    <th>${criteria.equiv}%</th>`;
                            }
                        });
                    });

                    var score_td = ``;
                    $.each(subject.scores, function (index_criteria, criteria) {
                        if (criteria.score.length == 0) {
                            score_td += `<td><b>0</b></td>`;
                        }
                        for (let i = 0; i < criteria.score.length; i++) {
                            let isLock = subject.criteria[index_criteria].activities[i].isLock;
                            isLock = (String(isLock) === 'true');
                            const score = criteria.score[i];
                            score_td += `<td data-score="${i}" data-criteria="${index_criteria}" data-subject="${subjectIndex}"
                                    style="background-color: ${isLock ? 'rgb(170, 170, 170) !important' : '#feffe5'}">${score}</td>`;
                            if (i == criteria.score.length - 1) {
                                score_td += `<td><b>${parseFloat(criteria.average).toFixed(2)}</b></td>`;
                            }
                        }
                    });
                    var statusRemarks = subject.remarks;
                    if (subject.isDrop) {
                        statusRemarks = "DROP";
                    }
                    accordionContent += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="subjectAccordion-${subjectIndex}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#subjectPanel-${subjectIndex}" aria-expanded="true" aria-controls="subjectPanel-${subjectIndex}">
                        <div class="w-100 d-flex justify-content-between">
                            <div>${subject.code} - ${subject.description}</div>
                            <div class="ms-auto">
                                <span class="mx-2">
                                    Grade: <span id="subjectGrade-${subjectIndex}" class="fw-bold">${parseFloat(subject.grade).toFixed(2)}</span>
                                </span>
                                <span class="mx-2">
                                     Equiv: <span id="subjectEquiv-${subjectIndex}" class="fw-bold">${parseFloat(subject.equiv).toFixed(2)}</span>
                                </span>
                                <span class="mx-2">
                                   Remarks: <span id="subjectRemarks-${subjectIndex}" class="fw-bold">${statusRemarks}</span>
                                </span>
                            </div>
                        </div>
                    </button>
                    </h2>
                    <div id="subjectPanel-${subjectIndex}" class="accordion-collapse collapse show" aria-labelledby="subjectAccordion-${subjectIndex}">
                    <div class="accordion-body px-0">
                        <div class="me-2 table-responsive">
                            <table class="table table-bordered border-secondary table-sm text-center" id="gradesTable-${subjectIndex}">
                                <thead>
                                    <colgroup>${colGroup}</colgroup>
                                    <tr>${criteria_th}</tr>
                                    <tr>${lockBtn_th}</tr>
                                    <tr>${activities_th}</tr>
                                    <tr>${score_th}</tr>
                                </thead>
                                <tbody class="table-group-divider">
                                    <tr>${score_td}</tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                </div>
                `;
                });

                $("#gradesAccordion").html(accordionContent);
                displayGWA(grades);

            }  // END OF displayStudentGrades 

            function displayGWA(grades) {
                const finalGrade = getGrade(grades);
                $("#finalGrade").html(getGrade(grades).toFixed(2));
                $("#finalEquiv").html(getEquiv(finalGrade).toFixed(2));
                $("#finalRemarks").html(getRemarks(finalGrade));
            }

            $("#studentList").addClass("d-none");
            $("#studentDetails").removeClass("d-none");
            $("#removeStudentModal").on("show.bs.modal", function () {
                $("#remove-fullName").html(selectedStudent.fullName);
                $("#remove-studentNo").html(selectedStudent.studentNo);
            })

            $("#remove-yes-btn").click(function (e) {
                e.preventDefault();
                $.ajax({
                    type: "POST",
                    url: "../student/process.student.php",
                    data: { REMOVE_STUDENT_REQ: selectedStudent.studentNo },
                    dataType: "JSON",
                    success: function (REMOVE_STUDENT_RESP) {
                        displayStudents($("#filter-level").val(), $("#filter-section").val());
                        $("#removeStudentModal").modal("hide");
                    }
                });
            });
            $("#editStudentModal").on("show.bs.modal", function () {
                $("#edit-oldStudentNo").val(selectedStudent.studentNo);
                $("#edit-studentNo").val(selectedStudent.studentNo);
                $("#edit-fullName").val(selectedStudent.fullName);
                $("#edit-email").val(selectedStudent.email);
                $("#edit-contactNo").val(selectedStudent.contact_no);
                $("input[name=edit-gender][value=" + selectedStudent.gender + "]").attr('checked', 'checked');
                $("#edit-specialization").val(selectedStudent.specialization);
                $("#edit-program").val(selectedStudent.program);
                $("#edit-level").val(selectedStudent.level);
                $("#edit-section").val(selectedStudent.section);
                let sub = ``;
                $.each(selectedStudent.subjects, function (indexInArray, subject) {
                    sub += `${subject.code}, `;
                });
                $("#edit-subjects").val(sub.slice(0, -1));
            });

            $("#backBtn").click(function (e) {
                e.preventDefault();
                $("#studentDetails").addClass("d-none");
                $("#studentList").removeClass("d-none");
            });
        });
    }

    var tempData = {};
    $("#fileUploadForm").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: '../student/process.student.php',
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
                $('#previewTable').DataTable();
            }, error: function (dataResult) {
                console.error(dataResult);
                $("#fileUploadBody").prepend(dataResult.responseText);
            }, beforeSend: function () {
                $("#fileUploadModal").modal("show");
                $("#previewSpinner").show();
            }
        });
    });

    $("#uploadSpinner").hide();
    $("#upload").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: '../student/process.student.php',
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
                        $("#updloadLabel").html("Upload");
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
                    displayStudents();
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
                We encounter problem. Some student may not be receive email from the system or didn't register to the system.
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

    $("#addNewStudentError").hide();
    $("#addStudentSpinner").hide();
    $("#addStudentForm").submit(function (e) {
        e.preventDefault();
        var data = $(this).serializeArray();  // Form Data
        data.push({ name: 'ADD_STUDENT_REQ', value: true });
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: data,
            dataType: "json",
            success: function (ADD_STUDENT_RESP) {
                $("#addLabel").html("Add New Student");
                $("#addStudentBtn").removeAttr("disabled");
                $("#addStudentSpinner").hide();

                if (ADD_STUDENT_RESP.status) {
                    $("#addNewStudentError").fadeOut();
                    $("#addStudentForm").trigger('reset');
                    $("#addStudentModal").modal("hide");
                } else {
                    if (ADD_STUDENT_RESP.msg.toLowerCase().includes("duplicate entry")) {
                        $("#addNewStudentError").html("The student number has already been assigned.");
                        $("#addNewStudentError").fadeIn();
                    } else {
                        $("#addNewStudentError").html(ADD_STUDENT_RESP.msg);
                        $("#addNewStudentError").fadeIn();
                    }
                }
                displayStudents();
            },
            beforeSend: function () {
                $("#addLabel").html("Adding New Student");
                $("#addStudentSpinner").show();
                $("#addStudentBtn").attr("disabled", "disabled");
            },
            error: function (response) {
                $("#addLabel").html("Add New Student");
                $("#addStudentBtn").removeAttr("disabled");
                $("#addStudentSpinner").hide();
                var errorMsg = response.responseText;
                console.error(errorMsg);
                if (errorMsg.toLowerCase().includes("duplicate entry")) {
                    $("#addNewStudentError").html("The student number has already been assigned.");
                    $("#addNewStudentError").fadeIn();
                } else {
                    $("#addNewStudentError").html(response.responseText);
                    $("#addNewStudentError").fadeIn();
                }
            }
        });
    });

    $("#editNewStudentError").hide();
    $("#editStudentForm").submit(function (e) {
        e.preventDefault();
        var data = $(this).serializeArray();  // Form Data
        data.push({ name: 'EDIT_STUDENT_REQ', value: true });
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: data,
            dataType: "json",
            success: function (EDIT_STUDENT_RESP) {
                if (EDIT_STUDENT_RESP.status) {
                    $("#editNewStudentError").fadeOut();
                    $("#editStudentForm").trigger('reset');
                    $("#editStudentModal").modal("hide");
                } else {
                    $("#editNewStudentError").html(EDIT_STUDENT_RESP.msg);
                    $("#editNewStudentError").fadeIn();
                }
                displayStudents($("#filter-level").val(), $("#filter-section").val());
            },
            error: function (response) {
                console.error(response.responseText);
                $("#editNewStudentError").html(response.responseText);
                $("#editNewStudentError").fadeIn();
            }
        });
    });

    function keepCloning(objectpassed) {
        if (objectpassed === null || typeof objectpassed !== 'object') {
            return objectpassed;
        }
        var temporary_storage = objectpassed.constructor();
        for (var key in objectpassed) {
            temporary_storage[key] = keepCloning(objectpassed[key]);
        }
        return temporary_storage;
    }

    function getGrade(arr) {
        return arr.reduce((a, b) => parseFloat(a) + parseFloat(b)) / arr.length
    }

    function getRemarks(grade) {
        if (grade < 75) {
            return "<span class='badge bg-danger'>FAILED</span>";
        } else {
            return "<span class='badge bg-success'>PASSED</span>";
        }
    }

    function getEquiv(grade) {
        grade = Math.floor(grade);
        if (grade <= 74) {
            return 5.00;
        } else if (grade <= 75) {
            return 3.00;
        } else if (grade <= 78) {
            return 2.75;
        } else if (grade <= 81) {
            return 2.50;
        } else if (grade <= 84) {
            return 2.25;
        } else if (grade <= 87) {
            return 2.00;
        } else if (grade <= 90) {
            return 1.75;
        } else if (grade <= 93) {
            return 1.50;
        } else if (grade <= 96) {
            return 1.25;
        } else if (grade <= 100) {
            return 1.00;
        }
    }
});
