$(document).ready(function () {
    var temp_subject = {};
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

    $.ajax({
        type: "POST",
        url: "../grade/process.grade.php",
        data: { GET_STUDENT_GRADES_REQ: true },
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
            $("#loadingScreen").modal("hide");
        }, error: function (response) {
            console.error(response);
            // $("#error").html(response.responseText);
        }, beforeSend: function (response) {
            $("#loadingScreen").modal("show");
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
                                contenteditable='${isLock ? 'false' : 'true'}' style="background-color: ${isLock ? 'rgb(170, 170, 170) !important' : '#feffe5'}">${score}</td>`;
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
                </button>
                </h2>
                <div id="subjectPanel-${subjectIndex}" class="accordion-collapse collapse show" aria-labelledby="subjectAccordion-${subjectIndex}">
                <div class="accordion-body px-0">
                    <div class="me-2 table-responsive">
                     
                    </div>
                </div>
                </div>
            </div>
            `;
        });

        $("#gradesAccordion").html(accordionContent);
        displayGWA(grades);

        $("td").on("blur", function () {
            const i_score = $(this).data("score");
            const i_criteria = $(this).data("criteria");
            const i_subject = $(this).data("subject");
            const newVal = parseInt($(this).html());
            var subject = temp_subject.subjects[i_subject];
            let total_over = 0;
            $.each(subject.criteria[i_criteria].activities, function (indexInArray, activity) {
                total_over += parseInt(activity.total);
            });
            subject.scores[i_criteria].score[i_score] = newVal;

            let total_score = 0;
            $.each(subject.scores[i_criteria].score, function (indexInArray, score) {
                total_score += parseInt(score);
            });

            let ave = (total_score / total_over) * 100;
            subject.scores[i_criteria].average = ave;

            console.log(total_score);
            // set grade
            let grade = 0;
            $.each(subject.criteria, function (i, criteria) {
                let ave = subject.scores[i].average;
                grade += (ave * (criteria.equiv / 100));
            });
            subject.grade = grade;

            // set equiv
            let equiv = getEquiv(grade);
            subject.equiv = equiv;

            // set remarks
            subject.remarks = (equiv == 5.00) ? "Failed" : "Passed";

            displayStudentGrades(temp_subject);
        });

    }  // END OF displayStudentGrades 

    function displayGWA(grades) {
        const finalGrade = getGrade(grades);
        $("#finalGrade").html(getGrade(grades).toFixed(2));
        $("#finalEquiv").html(getEquiv(finalGrade).toFixed(2));
        $("#finalRemarks").html(getRemarks(finalGrade));
    }

});  // END OF DOCUMENT READY FUNCTION


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
