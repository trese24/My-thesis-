$(document).ready(function () {

    let subjects;
    $("#addSubjectError").hide();
    setSubjectsFromDB();

    function getFormData($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};

        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value'];
        });
        return indexed_array;
    }

    $("#year_sem").change(function (e) {
        e.preventDefault();
        var year_sem = $(this).val();
        if (year_sem == "All") {
            displaySubjects(subjects);
        } else {
            var year = year_sem.split('-')[0];
            var sem = year_sem.split('-')[1];
            var filtered = subjects.filter(function (data) {
                return data.year_level == year && data.semester == sem;
            });
            displaySubjects(filtered);
        }
    });

    function setSubjectsFromDB() {
        $.ajax({
            type: "POST",
            url: "../subject/process.subject.php",
            data: { GET_ALL_SUBJECTS_REQ: true },
            dataType: "JSON",
            success: function (response) {
                subjects = response;
                displaySubjects(response);

                $("#loadingScreen").modal("hide");
            },
            error: function (response) {
                console.error(response);
                $("#errorAlert").removeClass("d-none");
                $("#errorAlert").html(response.responseText);
            },
            beforeSend: function (response) {
                $("#loadingScreen").modal("show");
            }
        });
    }

    function displaySubjects(subjects) {
        if ($.fn.DataTable.isDataTable("#allSubjectTable")) {
            $('#allSubjectTable').DataTable().clear().destroy();
        }
        var content = ``;
        $level = ['', "1st Year", "2nd Year", "3rd Year", "4th Year"];
        $sem = ['', "1st Semester", "2nd Semester"];
        $.each(subjects, function (i, subject) {
            content += `
            <tr>
                <td>${subject.code}</td>
                <td>${subject.description}</td>
                <td>${$level[subject.year_level]} - ${$sem[subject.semester]}</td>
                <td class="dt-center">${subject.lec_units}.0</td>
                <td class="dt-center">${subject.lab_units}.0</td>
                <td class="dt-center">${subject.total_units}.0</td>
                <td class="dt-center">${subject.hours_per_week}</td>
                <td>${subject.prereq}</td>
                <td>${subject.coreq}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="edit-btn btn btn-dark" data-id="${subject.id}"><i class="fal fa-edit"></i></button>
                        <button class="remove-btn btn btn-danger" data-id="${subject.id}" data-code="${subject.code}"><i class="far fa-trash-alt"></i></button>
                    </div>
                </td>
                
            </tr>
            `;
        });
        $("#subject_tdata").html(content);
        $("#allSubjectTable").DataTable();
        $(".edit-btn").click(function (e) {
            e.preventDefault();
            var id = $(this).data('id');
            var subject = subjects.filter(function (data) {
                return data.id == id;
            })[0];
            let yearSem = subject.year_level + '-' + subject.semester;
            $("#oldSubjectCode").html(subject.id);
            $("#editCode").html(subject.code);
            $("[name='editID']").val(subject.id);
            $("[name='editCode']").val(subject.code);
            $("[name='editDescription']").val(subject.description);
            $("[name='editSpecialization']").val(subject.specialization);
            $("[name='editYearSem']").val(yearSem);
            $("[name='editLecUnits']").val(subject.lec_units);
            $("[name='editLabUnits']").val(subject.lab_units);
            $("[name='editHoursPerWeek']").val(subject.hours_per_week);
            $("[name='editPrereq']").val(subject.prereq);
            $("[name='editCoReq']").val(subject.coreq);
            $("#viewSubjectModal").modal('show');
        });

        $("#editSubjectForm").submit(function (e) {
            e.preventDefault();
            let formData = getFormData($(this));
            let data = [];
            data.push({ name: 'id', value: $("#oldSubjectCode").html() });
            data.push({ name: 'EDIT_SUBJECT_REQ', value: JSON.stringify(formData) });
            console.log(data);
            $.ajax({
                type: "POST",
                url: "../subject/process.subject.php",
                data: data,
                dataType: "JSON",
                success: function (EDIT_SUBJECT_RESP) {
                    if (EDIT_SUBJECT_RESP.status) {
                        setSubjectsFromDB();
                        $("#viewSubjectModal").modal('hide');
                    } else {
                        console.error(EDIT_SUBJECT_RESP);
                        $("#errorAlert").removeClass("d-none");
                        $("#errorAlert").html(EDIT_SUBJECT_RESP.msg);
                    }
                },
                error: function (response) {
                    console.error(response);
                    $("#errorAlert").removeClass("d-none");
                    $("#errorAlert").html(response.responseText);
                }
            });
        });

        $(".remove-btn").click(function (e) {
            e.preventDefault();
            let id = $(this).data('id');
            let code = $(this).data('code');
            $("#removeCode").html(code);
            $("#removeSubjectModal").modal('show');

            $("#remove-yes-btn").click(function (e) {
                e.preventDefault();
                $.ajax({
                    type: "POST",
                    url: "../subject/process.subject.php",
                    data: { REMOVE_SUBJECT_REQ: { subjectID: id } },
                    dataType: "JSON",
                    success: function (REMOVE_SUBJECT_RESP) {
                        if (REMOVE_SUBJECT_RESP.status) {
                            setSubjectsFromDB();
                            $("#removeSubjectModal").modal('hide');
                        } else {
                            console.error(REMOVE_SUBJECT_RESP);
                            $("#errorAlert").removeClass("d-none");
                            $("#errorAlert").html(REMOVE_SUBJECT_RESP.responseText);
                        }
                    },
                    error: function (response) {
                        console.error(response);
                        $("#errorAlert").removeClass("d-none");
                        $("#errorAlert").html(response.responseText);
                    }
                });

            });
        });
    }

    $("#addSubjectForm").submit(function (e) {
        e.preventDefault();
        let formData = getFormData($(this));
        let data = [];
        data.push({ name: 'ADD_SUBJECT_REQ', value: JSON.stringify(formData) });
        $.ajax({
            type: "POST",
            url: "../subject/process.subject.php",
            data: data,
            dataType: "JSON",
            success: function (ADD_SUBJECT_RESP) {
                console.log(ADD_SUBJECT_RESP);
                if (ADD_SUBJECT_RESP.status) {
                    setSubjectsFromDB();
                    $("#addSubjectModal").trigger("reset");
                    $("#addSubjectModal").modal("hide");
                } else {
                    if (ADD_SUBJECT_RESP.msg.toLowerCase().includes("duplicate entry")) {
                        $("#addSubjectError").html("Subject code already exists.");
                        $("#addSubjectError").fadeIn();
                    } else {
                        $("#addSubjectError").html(ADD_FACULTY_RESP.msg);
                        $("#addSubjectError").fadeIn();
                    }
                }
            }, error: function (response) {
                console.error(response);
                if (response.responseText.toLowerCase().includes("duplicate entry")) {
                    $("#addSubjectError").html("Subject code already exists.");
                    $("#addSubjectError").fadeIn();
                } else {
                    $("#addSubjectError").html(response.responseText);
                    $("#addSubjectError").fadeIn();
                }
            }
        });
    });

});  // document ready function end 
