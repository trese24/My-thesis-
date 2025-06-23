$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: "../student/process.student.php",
        data: { GET_FACULTY_REQ: true },
        dataType: "JSON",
        success: function (GET_FACULTY_RESP) {
            let option = `<option value="All" selected>All</option>`;
            $.each(GET_FACULTY_RESP, function (indexInArray, val) {
                option += `<option value="${val.code}">${val.code} - ${val.description}</option>`;
            });
            $("#filter-subject").html(option);
        },
        beforeSend: function (response) {
            $("#loadingScreen").modal("show");
        }
    });

    $("#filter-subject").change(function (e) {
        e.preventDefault();
        getSectionBySubjectCode($(this).val());
        displayStudents($(this).val(), $("#filter-section").val());
    });

    $("#filter-section").change(function (e) {
        e.preventDefault();
        displayStudents($("#filter-subject").val(), $(this).val());
    });
    getSectionBySubjectCode();
    function getSectionBySubjectCode(subjectCode = "All") {
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { "GET_SECTION_REQ": subjectCode },
            dataType: "JSON",
            success: function (GET_SECTION_RESP) {
                var filtered = GET_SECTION_RESP.filter(function (val) {
                    if (subjectCode == "All") return true;
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

    function displayStudents(subject = 'All', section = '') {
        $.ajax({
            type: "POST",
            url: "../student/process.student.php",
            data: { GET_STUDENTS_REQ: true },
            dataType: "JSON",
            success: function (GET_STUDENTS_RESP) {
                var filtered = GET_STUDENTS_RESP.filter(function (student) {
                    let sub = false;
                    $.each(student.subjects, function (indexInArray, eachSub) {
                        if (sub) {
                            return false;
                        }
                        sub = (subject == "All") ? true : eachSub.code == subject;
                    });
                    let sec = student.section == section;
                    return sec && sub;
                });
                content = ``;
                $.each(filtered, function (indexInArray, student) {
                    content += `
                        <tr data-id="${student.studentNo}">
                            <td>${student.studentNo}</td>
                            <td>${student.fullName}</td>
                            <td>${student.program} ${student.section}</td>
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
                    "pageLength": 25
                });

                var selectedStudent = "";
                $("#studentRecords > tr").click(function (e) {
                    e.preventDefault();
                    studentNo = $(this).data("id");
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

                    $("#viewStudentModal").modal("show");
                });
                $("#loadingScreen").modal("hide");
            }, error: function (response) {
                console.error(response);
                $("#error").html(response.responseText);
            }
        });
    }

});
