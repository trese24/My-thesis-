$(document).ready(function () {
    $("#export").click(function (e) {
        e.preventDefault();
        $("#gradesTable").table2excel({
            // exclude: ".excludeThisClass",
            name: "Worksheet Name",
            filename: "grades.xls",
            preserveColors: false
        });
    });
    $("#uploadFileBtn").click(function (e) {
        e.preventDefault();
        $("#fileUpload").trigger('click');
    });

    $("#fileUpload").change(function (e) {
        e.preventDefault();
        $("#fileUploadForm").submit();
    });

    let infoContent = `
    <div class="row d-flex align-items-center gy-2">
        <div class="col-3">
            <div class="plus-btn bg-light border text-center"><i class="fal fa-plus"></i></div>
        </div>
        <div class="col-9">
            <div class="fw-bold">Add new activity</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        </div>
        <div class="col-3">
            <div class="minus-btn bg-light border text-center"><i class="fal fa-minus"></i></div>
        </div>
        <div class="col-9">
            <div class="fw-bold">Remove activity</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        </div>
        <div class="col-3">
            <div class="lock-btn bg-light active border text-center"><i class="fas fa-lock"></i></div>
        </div>
        <div class="col-9">
            <div class="fw-bold">Lock</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        </div>
        <div class="col-3">
            <div class="lock-btn bg-light border text-center"><i class="fas fa-unlock-alt"></i></div>
        </div>
        <div class="col-9">
            <div class="fw-bold">Unlock</div>
            <div>Activities that are unlocked can be edited by the student</div>
        </div>
    </div>
    `;
    $('#info-btn').popover({
        placement: "left",
        html: true,
        sanitize: false,
        title: "Info",
        content: infoContent,
        trigger: 'focus'
    });

    $.ajax({
        type: "POST",
        url: "../student/process.student.php",
        data: { GET_FACULTY_REQ: true },
        dataType: "JSON",
        success: function (GET_FACULTY_RESP) {
            let option = ``;
            let firstSubj = "";
            $.each(GET_FACULTY_RESP, function (indexInArray, val) {
                if (indexInArray == 0) firstSubj = val.code;
                option += `<option value="${val.code}">${val.code} - ${val.description}</option>`;
            });
            $("#filter-subject").html(option);
            getSectionBySubjectCode(firstSubj);
        },
        beforeSend: function (response) {
            $("#loadingScreen").modal("show");
        }
    });


    function getSectionBySubjectCode(subjectCode) {
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { "GET_SECTION_REQ": subjectCode },
            dataType: "JSON",
            success: function (GET_SECTION_RESP) {
                var filtered = GET_SECTION_RESP.filter(function (val) {
                    return val.code == subjectCode;
                });
                const unique = [...new Set(GET_SECTION_RESP.map(item => item.sections))];
                $("#filter-section").removeAttr("disabled");
                $("#filter-section-spinner").fadeOut();
                let op = ``;
                $.each(unique, function (indexInArray, section) {
                    op += `<option value="${section}">${section}</option>`;
                });
                $("#filter-section").html(op);
                displayStudents($("#filter-subject").val(), $("#filter-section").val());
            }, beforeSend: function () {
                $("#filter-section-spinner").fadeIn();
                $("#filter-section").attr("disabled", true);
            }, error: function (response) {
                console.error(response.responseText);
            }
        });
    }

    $("#filter-subject").change(function (e) {
        e.preventDefault();
        getSectionBySubjectCode($(this).val());
        displayStudents($(this).val(), $("#filter-section").val());
    });

    $("#filter-section").change(function (e) {
        e.preventDefault();
        displayStudents($("#filter-subject").val(), $("#filter-section").val());
    });

    $("#uploadClassRecord").on("hidden.bs.modal", function () {
        $("#fileUploadForm").trigger('reset');
    });

    var tempData = {};
    $("#fileUploadForm").submit(function (e) {
        $("#previewAlertError").addClass("d-none");
        $("#upload").removeAttr("disabled");
        e.preventDefault();
        var data = new FormData(this);
        $.ajax({
            url: '../grade/process.grade.php',
            type: 'POST',
            data: data,
            contentType: false,
            cache: false,
            processData: false,
            dataType: "JSON",
            success: function (FILE_UPLOAD_RESP) {
                // TODO: IF CODE OR SECTION IS EMPTY, SHOW WARNING ALERT SUGGEST DOWNLOAD CSV FORMAT
                tempData.code = FILE_UPLOAD_RESP[4][5].trim();  // * subject code coordinates
                tempData.description = FILE_UPLOAD_RESP[5][5];  // * subject description coordinates
                tempData.section = FILE_UPLOAD_RESP[6][5].trim();  // * subject section coordinates
                if (tempData.code != $("#filter-subject").val()) {
                    $("#upload").attr("disabled", true);
                    $("#previewAlertError").removeClass("d-none");
                }
                var content = `
                <div class="fs-5">Subject Code: <b>${tempData.code}</b></div>
                <div class="fs-5">Subject Description: <b>${tempData.description}</b></div>
                <div class="fs-5">Section: <b>${tempData.section}</b></div>
                <div class="table-responsive">
                    <table id="previewTable" class="table table-sm table-bordered display compact">
                        <thead>
                        `;

                tempData.students = [];
                tempData.criteria = [];
                $.each(FILE_UPLOAD_RESP, function (row, column) {
                    // * PRINT HEADERS
                    if (row >= 8 && row <= 10) {
                        content += `<tr>`;
                        $.each(column, function (col, val) {
                            content += `<th>${val}</th>`;
                        });
                        content += `</tr>`;
                    }

                    let message = {
                        client: {
                            id: "",
                            name: ""
                        },
                        employee: {
                            id: "",
                            name: ""
                        },
                        message: {
                            content: "",
                            dateTime: "",
                            status: ""
                        }
                    }

                    // * GET CRITERIA AND ACTIVITIES
                    // "criteria": [{
                    //     "name": "Activities/Project",
                    //     "equiv": 0.3,
                    //     "activities": [{
                    //         "name": "1",
                    //         "total": 100,
                    //         "isLock": false
                    //     }]
                    // }]
                    if (row == 8) {
                        let ctr = 0;
                        $.each(column, function (col, val) {
                            if (val == "FINAL GRADE") return false;
                            let criteria = {};
                            criteria.activities = [];
                            if (col >= 6) {
                                if (val != "") {
                                    ctr = col;
                                    do {
                                        let activities = {};
                                        activities.name = FILE_UPLOAD_RESP[row + 1][ctr];
                                        activities.total = parseInt(FILE_UPLOAD_RESP[row + 2][ctr]);
                                        activities.isLock = false;
                                        criteria.activities.push(activities);
                                        ctr++;
                                    } while (FILE_UPLOAD_RESP[row][ctr + 1] == '');
                                    ctr = col + 1;
                                    while (FILE_UPLOAD_RESP[row][ctr] == '') {
                                        ctr++;
                                    }
                                    criteria.equiv = parseInt(FILE_UPLOAD_RESP[row + 2][ctr - 1] * 100);
                                    criteria.name = val;
                                    tempData.criteria.push(criteria);
                                }
                            }
                        });
                    }

                    // * END OF HEADERS
                    if (row == 10) {
                        content += `</thead><tbody>`;
                    }

                    // * GET STUDENTS
                    // "students": [
                    //     {
                    //         "studentNo": "2018412425",
                    //         "name": "Dela Cruz, Juan",
                    //         "grade": 0,
                    //         "equiv": 5.0,
                    //         "remarks": "Failed",
                    //         "scores": [
                    //             {
                    //                 "average": 50,
                    //                 "score": [14]
                    //             }, {
                    //                 "average": 80,
                    //                 "score": [50, 90]
                    //             }, {
                    //                 "average": 50,
                    //                 "score": [20]
                    //             }, {
                    //                 "average": 60,
                    //                 "score": [52]
                    //             }, {
                    //                 "average": 70,
                    //                 "score": [65]
                    //             },
                    //         ]
                    //     }
                    if (row > 11) {
                        content += `<tr>`;
                        var student = {};
                        student.scores = [];
                        let ctr = 0;

                        // * GET SCORES
                        let totalLen = 6;
                        for (let i = 0; i < tempData.criteria.length; i++) {
                            actLen = tempData.criteria[i].activities.length;
                            let scores = {};
                            scores.score = [];
                            for (let j = 0; j < actLen; j++) {
                                const element = parseInt(FILE_UPLOAD_RESP[row][totalLen + j]);
                                scores.score.push(element);
                            }
                            totalLen += actLen + 1;
                            scores.average = parseFloat(FILE_UPLOAD_RESP[row][totalLen - 1]);
                            student.scores.push(scores);
                        }

                        // * GET OTHER DETAILS
                        $.each(column, function (col, val) {
                            content += `<td>${val}</td>`;
                            if (col == 2) student.studentNo = val;
                            if (col == 3) student.name = val;
                            if (col == 5) student.equiv = parseFloat(val);
                            if (col == totalLen) student.grade = parseFloat(val);
                            if (col == totalLen + 2) student.remarks = val;
                        });

                        tempData.students.push(student);
                        content += `</tr>`;
                    }

                });
                content += `</tbody></table>`;

                $("#previewSpinner").fadeOut();
                $("#fileUploadBody").html(content);
            }, error: function (response) {
                console.error(response);
                $("#fileUploadBody").prepend(response.responseText);
            }, beforeSend: function () {
                $("#uploadClassRecord").modal("show");
                $("#previewSpinner").show();
            }
        });
    });

    $("#uploadSpinner").hide();
    $("#upload").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: '../grade/process.grade.php',
            type: 'POST',
            data: { UPDATE_CLASS_RECORD_REQ: tempData },
            dataType: 'json',
            success: function (UPLOAD_FILE_RESP) {
                var flag = true;
                $.each(UPLOAD_FILE_RESP, function (indexInArray, valueOfElement) {
                    if (!valueOfElement.status) {
                        flag = false;
                    }
                });
                $("#fileUploadForm").trigger('reset');
                $("#updloadLabel").html("Upload");
                $("#upload").removeAttr("disabled");
                $("#uploadSpinner").hide();
                if (flag) {
                    $("#uploadClassRecord").modal("hide");
                    $("#fileUploadBody").html('');
                    $("#fileUploadForm").trigger('reset');
                    displayStudents($("#filter-subject").val(), $("#filter-section").val());
                } else {
                    console.error(valueOfElement.msg);
                    var content = `
                        <div class="alert alert-warning alert-dismissible fade show mb-2 py-2" role="alert">
                           
                        <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                    $("#fileUploadBody").prepend(content);
                }
            }, error: function (response) {
                console.error(response.responseText);
                $("#fileUploadBody").prepend(response.responseText);
            }, beforeSend: function () {
                $("#uploadSpinner").show();
                $("#updloadLabel").html("Uploading");
                $("#upload").attr("disabled", "disabled");
            }
        });
    });

    function displayStudents(subject = '', section = '') {
        var json = {};
        $.ajax({
            type: "POST",
            url: "../grade/process.grade.php",
            data: { GET_STUDENT_GRADES_REQ: true },
            dataType: "JSON",
            success: function (GET_STUDENT_GRADES_RESP) {
                var filtered = GET_STUDENT_GRADES_RESP.filter(function (student) {
                    let sub = false;
                    $.each(student.subjects, function (indexInArray, eachSub) {
                        if (sub) {
                            return false;
                        }
                        sub = ($.trim(eachSub.code) == subject);
                    });
                    let sec = student.section == section;
                    return sec && sub;
                });
                json.criteria = [];
                json.students = [];
                $.each(filtered, function (indexInArray, student) {
                    var details = {};
                    $.each(student.subjects, function (indexInArray, sub) {
                        if (sub.code == subject) {
                            details.studentNo = student.studentNo;
                            details.name = student.fullName;
                            details.scores = sub.scores;
                            details.grade = sub.grade;
                            details.equiv = sub.equiv;
                            details.remarks = sub.remarks;
                            details.isDrop = sub.isDrop;
                            json.students.push(details)
                            json.criteria = sub.criteria;
                        }
                    });
                });
                fetchGrades(json);
            }, beforeSend: function () {
                $("#loadingScreen").modal("show");
            }, error: function (response) {
                console.error(response);
                $("#error").html(response.responseText);
            }
        });

        $("#save-btn").click(function (e) {
            e.preventDefault();
            let temp_json = keepCloning(json);
            temp_json.code = $("#filter-subject").val();
            temp_json.section = $("#filter-section").val();
            $.ajax({
                type: "POST",
                url: "../grade/process.grade.php",
                data: { UPDATE_CLASS_RECORD_REQ: temp_json },
                dataType: "JSON",
                success: function (SAVE_CHANGES_RESP) {
                    var flag = true;
                    $.each(SAVE_CHANGES_RESP, function (indexInArray, valueOfElement) {
                        if (!valueOfElement.status) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        $("#error").html('');
                        $("#error").addClass('d-none');
                        $("#saveChangesModal").modal("hide");
                        displayStudents($("#filter-subject").val(), $("#filter-section").val());
                    } else {
                        $("#error").removeClass('d-none');
                        console.error(SAVE_CHANGES_RESP);
                        var content = `We encounter a problem on saving class record`;
                        $("#error").html(content);
                    }
                }, error: function (response) {
                    console.error(response.responseText);
                    $("#error").removeClass('d-none');
                    $("#error").html(response.responseText);
                }
            });
        });

    }

    $("#top10Modal, #unofficialDropModal, #officialDropModal").on("show.bs.modal", function () {
        $(".subjectModal").html($("#filter-subject").val());
        $(".sectionModal").html($("#filter-section").val());
    });

});  // END OF DOCUMENT READY FUNCTION

function fetchGrades(json) {
    $(document).ready(function () {
        let colGroup = ``;
        let criteria_th = ``;
        let activities_th = ``;
        let actionBtn_th = ``;
        let lockBtn_th = ``;
        let score_th = ``;
        let act_ctr = 5;
        $.each(json.criteria, function (index, criteria) {
            let cri_len = criteria.activities.length;
            act_ctr += cri_len;
            colGroup += `<col span="${cri_len}">
                    <col style="background-color: #ffe5d0;">`;
            criteria_th += `<th colspan="${cri_len + 1}">${criteria.name}</th>`;
            if (criteria.activities.length == 0) {
                actionBtn_th = `<th data-index="${index}" data-bs-toggle='popover' class="plus-btn bg-light"><i class="fal fa-plus"></i></th>`;
                activities_th = `<th>Equiv</th>`;
                score_th = `<th>${criteria.equiv}%</th>`;
            }
            $.each(criteria.activities, function (i, activity) {
                activity.isLock = (String(activity.isLock) === 'true');
                if (cri_len - 1 != i) {
                    actionBtn_th += `<th data-criteria="${index}" data-act="${i}" class="minus-btn bg-light"><i class="fal fa-minus"></i></th>`;
                    lockBtn_th += `<th data-criteria="${index}" data-act="${i}" class="lock-btn bg-light ${activity.isLock ? 'active' : ''}">
                        <i class="fas ${activity.isLock ? 'fa-lock' : 'fa-unlock-alt'}"></i></th>`;
                    activities_th += `<th>${activity.name}</th>`;
                    score_th += `<th>${activity.total}</th>`;
                } else {
                    actionBtn_th += `<th data-criteria="${index}" data-act="${i}" class="minus-btn bg-light"><i class="fal fa-minus"></i></th>`;
                    lockBtn_th += `<th data-criteria="${index}" data-act="${i}" class="lock-btn bg-light ${activity.isLock ? 'active' : ''}">
                        <i class="fas ${activity.isLock ? 'fa-lock' : 'fa-unlock-alt'}"></i></th>`;
                    lockBtn_th += `<th rowspan='2'>Equiv</th>`;
                    actionBtn_th += `<th data-index="${index}" data-bs-toggle='popover' class="plus-btn bg-light"><i class="fal fa-plus"></i></th>`;
                    activities_th += `
                    <th>${activity.name}</th>`;
                    score_th += `
                        <th>${activity.total}</th>
                        <th>${criteria.equiv}%</th>`;
                }
            });

        });

        let tbody = ``;
        json.students.sort(function (a, b) {
            if (a.name > b.name) { return 1 }
            if (a.name < b.name) { return -1 }
            return 0;
        });
        $.each(json.students, function (index_student, student) {
            let score_td = ``;
            $.each(student.scores, function (index_criteria, criteria) {
                if (criteria.score.length == 0) {
                    score_td += `<td><b>50.00</b></td>`;
                }
                for (let i = 0; i < criteria.score.length; i++) {
                    let isLock = json.criteria[index_criteria].activities[i].isLock;
                    isLock = (String(isLock) === 'true');
                    const score = criteria.score[i];
                    score_td += `<td data-score="${i}" data-criteria="${index_criteria}" data-student="${index_student}" 
                        contenteditable='${isLock ? 'false' : 'true'}' style="background-color: ${isLock ? 'rgb(170, 170, 170) !important' : '#feffe5'};">${score}</td>`;
                    if (i == criteria.score.length - 1) {
                        score_td += `<td><b>${parseFloat(criteria.average).toFixed(2)}</b></td>`;
                    }
                }
            });
            var statusRemarksBg = "";
            var statusRemarks = student.remarks;
            if (student.isDrop) {
                statusRemarksBg = "table-dark";
                statusRemarks = "DROP";
            } else if (student.remarks == "Failed") {
                statusRemarksBg = "table-danger";
            }
            tbody += `
            <tr>
                <td>${student.studentNo}</td>
                <td class="text-start"><button class="btn btn-link m-0 p-0 text-start viewStudent" style="font-size: 14px;" data-drop="${student.isDrop}" data-id='${student.studentNo}'>${student.name}</button></td>
                <td><b>${parseFloat(student.equiv).toFixed(2)}</b></td>
                ${score_td}
                <td>${parseFloat(student.grade).toFixed(2)}</td>
                <td>${parseFloat(student.equiv).toFixed(2)}</td>
                <td class="${statusRemarksBg}">${statusRemarks}</td>
            </tr>`;
        });
        let tContent = `
        <colgroup>
            <col span="2">
            <col style="background-color: #ffda6a;">
            ${colGroup}
        </colgroup>
        <thead>
        <tr>
            <th rowspan="5">Student No.</th>
            <th rowspan="5">Name</th>
            <th rowspan="5">Final Grade</th>
            ${criteria_th}
            <th colspan="3">Final Grade</th>
        </tr>
        <tr>
            ${actionBtn_th}
            <th rowspan="4">Grade</th>
            <th rowspan="4">Equiv</th>
            <th rowspan="4">Remarks</th>
        </tr>
        <tr>
            ${lockBtn_th}
            
        </tr>
        <tr>
            ${activities_th}
        </tr>
        <tr>
            ${score_th}
        </tr>
        </thead>
        <tbody class="table-group-divider">
            ${tbody}
        </tbody>
        `;

        $("#gradesTable").html(tContent);

        displayTop10Students(json);
        unofficialDropStudent(json);
        officialDropStudent(json);
        $("#loadingScreen").modal("hide");

        // LOCK ACTIVITY
        $(".lock-btn").click(function (e) {
            e.preventDefault();
            let i_criteria = $(this).data("criteria");
            let i_act = $(this).data("act");
            let isLock = json.criteria[i_criteria].activities[i_act].isLock;
            isLock = (String(isLock) === 'true');
            json.criteria[i_criteria].activities[i_act].isLock = String(!isLock);
            fetchGrades(json);
        });

        // REMOVE ACTIVITY
        $(".minus-btn").click(function (e) {
            e.preventDefault();
            let i_criteria = $(this).data("criteria");
            let i_act = $(this).data("act");
            $("#removeModal").modal("show");
            $("#remove-yes-btn").click(function (e) {
                e.preventDefault();
                $.each(json.students, function (indexInArray, student) {
                    if (student.scores !== null) {
                        student.scores[i_criteria].score.splice(i_act, 1);
                    }
                });
                json.criteria[i_criteria].activities.splice(i_act, 1);
                fetchGrades(json);
                $("#removeModal").modal("hide");
            });
        });

        // ADD ACTIVITY
        let popoverContent = `
        <form id="addColumnForm" style="width: 150px;">
            <div class="row">
                <div class="col-4">
                    <label class="mt-1 for="label">Label</label>
                </div>
                <div class="col-8 mb-1">
                    <input type="text" class="form-control form-control-sm" id="addLabel">
                </div>
                <div class="col-4">
                    <label class="mt-1 for="label">Score</label>
                </div>
                <div class="col-8 mb-1">
                    <input type="number" min="0" class="form-control form-control-sm" id="addScore">
                </div>
            </div>
            <input type="submit" class="btn btn-sm btn-success w-100" value="Add">
        </form>`;
        $('[data-bs-toggle="popover"]').popover({
            placement: "bottom",
            html: true,
            sanitize: false,
            title: "Add Column",
            content: popoverContent
        });
        var cur_ind;
        $("[data-bs-toggle='popover']").click(function (e) {
            cur_ind = $(this).data("index");
        });

        $("[data-bs-toggle='popover']").on("shown.bs.popover", function () {
            $("#addColumnForm").submit(function (e) {
                e.preventDefault();
                $('[data-bs-toggle="popover"]').popover("hide");
                json.criteria[cur_ind].activities.push({ name: $("#addLabel").val(), total: $("#addScore").val() });
                $.each(json.students, function (indexInArray, student) {
                    if (student.scores !== null) {
                        student.scores[cur_ind].score.push('');
                    }
                });
                fetchGrades(json);
            });
        });

        $("td").one("DOMSubtreeModified", function () {
            $(this).addClass("table-warning");
        });

        $("td").on("blur", function () {
            let i_score = $(this).data("score");
            let i_student = $(this).data("student");
            let i_criteria = $(this).data("criteria");
            let newVal = parseInt($(this).html());
            let criteria_total = json.criteria[i_criteria].activities[i_score].total;
            if (newVal >= 0 && newVal <= criteria_total) {
                let total_over = 0;
                $.each(json.criteria[i_criteria].activities, function (indexInArray, activity) {
                    total_over += parseInt(activity.total);
                });
                json.students[i_student].scores[i_criteria].score[i_score] = newVal;
                let total_score = 0;
                $.each(json.students[i_student].scores[i_criteria].score, function (indexInArray, score) {
                    total_score += parseInt(score);
                });
                let ave = (total_score / total_over) * 100;
                json.students[i_student].scores[i_criteria].average = ave;
                // set grade
                let grade = 0;
                $.each(json.criteria, function (i, criteria) {
                    let ave = json.students[i_student].scores[i].average;
                    grade += (ave * (criteria.equiv / 100));
                });
                json.students[i_student].grade = grade;

                // set equiv
                let equiv = getEquiv(grade);
                json.students[i_student].equiv = equiv;

                // set remarks
                json.students[i_student].remarks = (equiv == 5.00) ? "Failed" : "Passed";
                fetchGrades(json);
            } else {
                alert("Invalid Input! Please input grade from 0-" + criteria_total);
            }
        });

        var selectedStudent = "";
        $(".viewStudent").click(function (e) {
            e.preventDefault();

            studentNo = $(this).data("id");
            isDrop = (String($(this).data("drop")) === 'true');
            if (isDrop) {
                $("#dropBtn").hide();
                $("#retrieveBtn").show();
            } else {
                $("#dropBtn").show();
                $("#retrieveBtn").hide();
            }
            $.ajax({
                type: "POST",
                url: "../student/process.student.php",
                data: { GET_STUDENTS_REQ: true },
                dataType: "JSON",
                success: function (GET_STUDENTS_RESP) {
                    selectedStudent = GET_STUDENTS_RESP.filter(function (eachStudent) {
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

                    $("#loadingScreen").modal("hide");
                    $("#viewStudentModal").modal("show");
                },
                beforeSend: function () {
                    $("#loadingScreen").modal("show");
                }
            });

            $("#dropBtn").click(function (e) {
                e.preventDefault();
                $("#dropStudentModal").modal("show");
            });

            $("#retrieveBtn").click(function (e) {
                e.preventDefault();
                $("#retrieveStudentModal").modal("show");
            });
        });

        $("#dropBtnConfirm").click(function (e) {
            e.preventDefault();
            var subject = $("#filter-subject").val();
            updateDropStatus(studentNo, subject, true, json);
            $("#dropStudentModal").modal("hide");
        });

        $("#retrieveBtnConfirm").click(function (e) {
            e.preventDefault();
            var subject = $("#filter-subject").val();
            updateDropStatus(studentNo, subject, false, json);
            $("#retrieveStudentModal").modal("hide");
        });
    });
}

function updateDropStatus(studentNo, subjectCode, status, json) {
    $.ajax({
        type: "POST",
        url: "../grade/process.grade.php",
        data: {
            UPDATE_DROP_STATUS_REQ: true,
            studentNo: studentNo,
            subject: subjectCode,
            status: status
        },
        dataType: "JSON",
        success: function (response) {
            $.each(json.students, function (i, student) {
                if (student.studentNo == studentNo) {
                    student.isDrop = status;
                }
            });
            fetchGrades(json);
            $("#viewStudentModal").modal("hide");
        }
    });
}

function displayTop10Students(json) {
    $(document).ready(function () {
        var content = ``;
        var outstandingStudent = [];
        $.each(json.students, function (key, value) {
            outstandingStudent.push({ v: value.grade, k: key });
        });
        outstandingStudent.sort(function (a, b) {
            if (a.v > b.v) { return -1 }
            if (a.v < b.v) { return 1 }
            return 0;
        });
        $.each(outstandingStudent, function (i, val) {
            if (i < 10) {
                content += `
                <tr class="${((i < 3) ? "table-info" : "")}">
                <td>${i + 1}.</td>
                <td>${json.students[val.k].studentNo}</td>
                <td class='text-start'>${json.students[val.k].name}</td>
                <td>${parseFloat(json.students[val.k].grade).toFixed(2)}</td>
                <td class='fw-bold'>${parseFloat(json.students[val.k].equiv).toFixed(2)}</td>
                </tr>`;
            }

        });

        $("#top10StudentBody").html(content);
    });
}

function officialDropStudent(json) {
    $(document).ready(function () {
        var content = ``;
        var filtered = json.students.filter(function (data) {
            return data.isDrop;
        });
        $.each(filtered, function (i, val) {
            content += `
            <tr">
                <td>${val.studentNo}</td>
                <td class='text-start'>${val.name}</td>
                <td>${parseFloat(val.grade).toFixed(2)}</td>
                <td class='fw-bold'>${parseFloat(val.equiv).toFixed(2)}</td>
            </tr>`;
        });

        $("#officialDropStudent").html(content);
    });
}

function unofficialDropStudent(json) {
    $(document).ready(function () {
        let temp_json = keepCloning(json);
        var content = ``;
        $.each(temp_json.criteria, function (key_criteria, criteria) {
            $.each(criteria.activities, function (key_act, activity) {
                $.each(temp_json.students, function (key_stud, student) {
                    if (student.scores !== null) {
                        activity.isLock = (String(activity.isLock) === 'true');
                        if (!activity.isLock) {
                            student.scores[key_criteria].score[key_act] = activity.total;
                        }
                        let total_over = 0;
                        $.each(criteria.activities, function (indexInArray, act) {
                            total_over += parseInt(act.total);
                        });
                        let total_score = 0;
                        $.each(student.scores[key_criteria].score, function (indexInArray, score) {
                            total_score += parseInt(score);
                        });
                        let ave = (total_score / total_over) * 100;
                        student.scores[key_criteria].average = ave;

                        // set grade
                        let grade = 0;
                        $.each(temp_json.criteria, function (ind, cri) {
                            let ave = parseFloat(student.scores[ind].average);
                            grade += (ave * (cri.equiv / 100));
                        });
                        student.grade = grade;

                        // set equiv
                        let equiv = getEquiv(grade);
                        student.equiv = equiv;

                        // set remarks
                        student.remarks = (equiv == 5.00) ? "Failed" : "Passed";

                    }
                });
            });
        });

        var filtered = temp_json.students.filter(function (data) {
            return data.remarks == "Failed";
        });

        $.each(filtered, function (i, val) {
            content += `
            <tr">
                <td>${val.studentNo}</td>
                <td class='text-start'>${val.name}</td>
                <td>${parseFloat(val.grade).toFixed(2)}</td>
                <td class='fw-bold'>${parseFloat(val.equiv).toFixed(2)}</td>
            </tr>`;
        });

        $("#dropStudent").html(content);
    });
}

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

function addColumn(index, label, score) {
    $(document).ready(function () {
        json.criteria[index].activity.push({ name: label, score: score });
        $.each(json.students, function (indexInArray, student) {
            student.scores[index].score.push('');
        });
        fetchGrades(json);
    });
}


