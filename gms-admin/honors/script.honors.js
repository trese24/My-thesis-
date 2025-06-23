$(document).ready(function () {
    var myStudents = [];
    var honor = [];
    var excellence = [];

    $.ajax({
        type: "POST",
        url: "../honors/process.honors.php",
        data: { GET_STUDENTS_REQ: true },
        dataType: "JSON",
        success: function (GET_STUDENTS_RESP) {
            myStudents = GET_STUDENTS_RESP;
            $.each(myStudents, function (stud_index, stud) {
                candidateForAcademicHonor(stud);
                candidateForAcademicExcellenceAward(stud);
            });

            let studentCount = myStudents.length;
            $("#studentCount").html(studentCount);

            $("#loadingScreen").modal("hide");
            $(".honorTable").DataTable({
                order: [[3, 'desc']],
                "lengthMenu": [[5, 10, 25, 50], [5, 10, 25, 50]],
                "pageLength": 10
            });

            displayAcademicExcellence($("#academicExcellenceSelect").val());
            displayAcademicHonor($("#academicHonorSelect").val());
        },
        beforeSend: function (response) {
            $("#loadingScreen").modal("show");
        }, error: function (response) {
            console.log(response.responseText);
            $("#error").html(response.responseText);
        }
    });

    $("#academicHonorSelect").change(function (e) {
        e.preventDefault();
        displayAcademicHonor($(this).val());
    });

    $("#academicExcellenceSelect").change(function (e) {
        e.preventDefault();
        displayAcademicExcellence($(this).val());
    });

    function candidateForAcademicExcellenceAward(stud) {
        var grades = [];
        var level = stud.level.charAt(0);
        var levelSubject = stud.subjects.filter(function (data) {
            return data.level == level;
        });
        $.each(levelSubject, function (indexInArray, sub2) {
            grades.push(parseFloat(sub2.grade));
        });

        var grade = parseFloat(getGrade(grades));

        var candidate = {
            studentNo: stud.studentNo,
            fullName: stud.fullName,
            section: stud.section,
            level: stud.level,
            grade: parseFloat(grade).toFixed(2),
            equiv: getEquiv(grade).toFixed(2),
            award: ""
        };
        if (!grades.some((x) => { return x < 85; })) {
            if (grade >= 95) {
                candidate.award = "President's List";
                excellence.push(candidate);
            } else if (grade >= 88) {
                candidate.award = "Dean's List";
                excellence.push(candidate);
            }
        }
    }

    function displayAcademicExcellence(filter) {
        var content = ``;
        var filtered = excellence.filter(function (data) {
            if (filter == 'All') return true;
            return data.award == filter;
        });
        $.each(filtered, function (indexInArray, val) {
            content += `
                <tr>
                    <td>${val.studentNo}</td>
                    <td>${val.fullName}</td>
                    <td>${val.level}</td>
                    <td>${val.section}</td>
                    <td>${val.award}</td>
                    <td>${val.grade}</td>
                    <td class="fw-bold">${val.equiv}</td>
                </tr>
            `;
        });
        if ($.fn.DataTable.isDataTable("#academicExcellenceTable")) {
            $('#academicExcellenceTable').DataTable().clear().destroy();
        }
        $("#academicExcellenceContent").html(content);
        $("#academicExcellenceTable").DataTable({
            order: [[5, 'desc']],
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "pageLength": 10
        });
    }

    function candidateForAcademicHonor(stud) {
        var grades = [];
        $.each(stud.subjects, function (indexInArray, sub2) {
            grades.push(parseFloat(sub2.grade));
        });
        var grade = parseFloat(getGrade(grades));

        var candidate = {
            studentNo: stud.studentNo,
            fullName: stud.fullName,
            section: stud.section,
            level: stud.level,
            grade: parseFloat(grade).toFixed(2),
            equiv: getEquiv(grade).toFixed(2),
            award: ""
        };
        if (!grades.some((x) => { return x < 85; })) {
            if (grade >= 95) {
                candidate.award = "Summa Cum Laude";
                honor.push(candidate);
            }
        } else if (!grades.some((x) => { return x <= 82; })) {
            if (grade >= 92) {
                candidate.award = "Magna Cum Laude";
                honor.push(candidate);
            }
        } else if (!grades.some((x) => { return x <= 79; })) {
            if (grade >= 88) {
                candidate.award = "Cum Laude";
                honor.push(candidate);
            }
        }
    }

    function displayAcademicHonor(filter) {
        var content = ``;
        var filtered = honor.filter(function (data) {
            if (filter == 'All') return true;
            return data.award == filter;
        });
        $.each(filtered, function (indexInArray, val) {
            content += `
                <tr>
                    <td>${val.studentNo}</td>
                    <td>${val.fullName}</td>
                    <td>${val.section}</td>
                    <td>${val.award}</td>
                    <td>${val.grade}</td>
                    <td class="fw-bold">${val.equiv}</td>
                </tr>
        `;
        });
        if ($.fn.DataTable.isDataTable("#academicHonorTable")) {
            $('#academicHonorTable').DataTable().clear().destroy();
        }
        $("#academicHonorsTableContent").html(content);
        $("#academicHonorTable").DataTable({
            order: [[4, 'desc']],
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "pageLength": 10
        });
    }

    function getGrade(arr) {
        return arr.reduce((a, b) => parseFloat(a) + parseFloat(b)) / arr.length
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
