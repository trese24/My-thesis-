$(document).ready(function () {
    var myStudents = [];
    var allSubjects;
    var yearLevelCount = [0, 0, 0, 0];
    $.ajax({
        type: "POST",
        url: "../dashboard/process.dashboard.php",
        data: { GET_STUDENTS_REQ: true },
        dataType: "JSON",
        success: function (GET_STUDENTS_RESP) {
            myStudents = GET_STUDENTS_RESP;
            let prCtr = [0, 0, 0, 0];
            let frCtr = [0, 0, 0, 0];
            let maleCtr = [0, 0, 0, 0];
            let maleCtrTotal = [0, 0, 0, 0];
            let femaleCtr = [0, 0, 0, 0];
            let femaleCtrTotal = [0, 0, 0, 0];
            var honorCtr = [0, 0, 0];
            var excellenceAwardCtr = [0, 0];
            $.each(myStudents, function (stud_index, stud) {
                switch (stud.level.toUpperCase()) {
                    case "1ST YEAR":
                        yearLevelCount[0]++;
                        isPassed(stud) ? prCtr[0]++ : frCtr[0]++;
                        if (stud.gender == "Male") {
                            if (isPassed(stud)) maleCtr[0]++;
                            maleCtrTotal[0]++;
                        } else {
                            if (isPassed(stud)) femaleCtr[0]++;
                            femaleCtrTotal[0]++;
                        }
                        break;
                    case "2ND YEAR":
                        yearLevelCount[1]++;
                        isPassed(stud) ? prCtr[1]++ : frCtr[1]++;
                        if (stud.gender == "Male") {
                            if (isPassed(stud)) maleCtr[1]++;
                            maleCtrTotal[1]++;
                        } else {
                            if (isPassed(stud)) femaleCtr[1]++;
                            femaleCtrTotal[1]++;
                        }
                        break;
                    case "3RD YEAR":
                        yearLevelCount[2]++;
                        isPassed(stud) ? prCtr[2]++ : frCtr[2]++;
                        if (stud.gender == "Male") {
                            if (isPassed(stud)) maleCtr[2]++;
                            maleCtrTotal[2]++;
                        } else {
                            if (isPassed(stud)) femaleCtr[2]++;
                            femaleCtrTotal[2]++;
                        }
                        break;
                    case "4TH YEAR":
                        yearLevelCount[3]++;
                        isPassed(stud) ? prCtr[3]++ : frCtr[3]++;
                        if (stud.gender == "Male") {
                            if (isPassed(stud)) maleCtr[3]++;
                            maleCtrTotal[3]++;
                        } else {
                            if (isPassed(stud)) femaleCtr[3]++;
                            femaleCtrTotal[3]++;
                        }
                        break;
                    default: break;
                }
                honorCtr = candidateForAcademicHonor(stud, honorCtr);
                excellenceAwardCtr = candidateForAcademicExcellenceAward(stud, excellenceAwardCtr);
                $.each(stud.subjects, function (indexInArray, sub2) {
                    getUnofficialDropStudents(sub2, stud_index);
                });
            });

            let studentCount = myStudents.length;
            $("#studentCount").html(studentCount);

            // CHART #1: NUMBER OF STUDENT PER  YEAR LEVEL
            chart1.data.datasets[0].data = yearLevelCount;
            chart1.update();

            // CHART #2: PASSING RATE PER YEAR LEVEL
            for (let x = 0; x < yearLevelCount.length; x++) {
                frCtr[x] = Math.ceil(frCtr[x] / yearLevelCount[x] * 100);
                prCtr[x] = Math.ceil(prCtr[x] / yearLevelCount[x] * 100);
                maleCtr[x] = Math.ceil(maleCtr[x] / maleCtrTotal[x] * 100);
                femaleCtr[x] = Math.ceil(femaleCtr[x] / femaleCtrTotal[x] * 100);
            }
            chart2.data.datasets[0].data = prCtr;
            chart2.data.datasets[1].data = frCtr;
            chart2.update();

            // CHART #4: GENDER PASSING RATE
            chart4.data.datasets[0].data = maleCtr;
            chart4.data.datasets[1].data = femaleCtr;
            chart4.update();

            // CHART #5
            $("#summaCumLaudeCtr").html(honorCtr[0]);
            $("#magnaCumLaudeCtr").html(honorCtr[1]);
            $("#cumLaudeCtr").html(honorCtr[2]);
            chart5.data.datasets[0].data = honorCtr;
            chart5.update();

            // CHART #6
            $("#presidentListCtr").html(excellenceAwardCtr[0]);
            $("#deansListCtr").html(excellenceAwardCtr[1]);
            chart6.data.datasets[0].data = excellenceAwardCtr;
            chart6.update();

            displayPassingRatePerSubject();

            $("#loadingScreen").modal("hide");
            $(".honorTable").DataTable({
                order: [[3, 'desc']],
                "lengthMenu": [[5, 10, 25, 50], [5, 10, 25, 50]],
                "pageLength": 5
            });
            $(".academicTable").DataTable({
                order: [[4, 'desc']],
                "lengthMenu": [[5, 10, 25, 50], [5, 10, 25, 50]],
                "pageLength": 5
            });
            $("#dropStudentTable").DataTable({
                "lengthMenu": [[5, 10, 25, 50], [5, 10, 25, 50]],
                "pageLength": 5
            });
        },
        beforeSend: function (response) {
            $("#loadingScreen").modal("show");
        }, error: function (response) {
            console.log(response.responseText);
            $("#error").html(response.responseText);
        }
    });

    function candidateForAcademicExcellenceAward(stud, excellenceAwardCtr) {
        var grades = [];
        var level = stud.level.charAt(0);
        var levelSubject = stud.subjects.filter(function (data) {
            return data.level == level;
        });
        $.each(levelSubject, function (indexInArray, sub2) {
            grades.push(parseFloat(sub2.grade));
        });

        var grade = parseFloat(getGrade(grades));
        if (!grades.some((x) => { return x < 85; })) {
            if (grade >= 95) {
                excellenceAwardCtr[0]++;
            } else if (grade >= 88) {
                excellenceAwardCtr[1]++;
            }
        }
        console.log(excellenceAwardCtr);
        return excellenceAwardCtr;
    }

    function getUnofficialDropStudents(students, index) {
        let temp_json = keepCloning(students);
        $.each(temp_json.criteria, function (key_criteria, criteria) {
            $.each(criteria.activities, function (key_act, activity) {
                activity.isLock = (String(activity.isLock) === 'true');
                if (!activity.isLock) {
                    temp_json.scores[key_criteria].score[key_act] = activity.total;
                }
                let total_over = 0;
                $.each(criteria.activities, function (indexInArray, act) {
                    total_over += parseInt(act.total);
                });
                let total_score = 0;
                $.each(temp_json.scores[key_criteria].score, function (indexInArray, score) {
                    total_score += parseInt(score);
                });
                let ave = (total_score / total_over) * 50 + 50;
                temp_json.scores[key_criteria].average = ave;

                // set grade
                let grade = 0;
                $.each(temp_json.criteria, function (ind, cri) {
                    let ave = parseFloat(temp_json.scores[ind].average);
                    grade += (ave * (cri.equiv / 100));
                });
                temp_json.grade = grade;

                // set equiv
                let equiv = getEquiv(grade);
                temp_json.equiv = equiv;

                // set remarks
                temp_json.remarks = (equiv == 5.00) ? "Failed" : "Passed";
            });
        });
        if (temp_json.remarks == "Failed") {
            let content = `
            <tr>
                <td>${myStudents[index].studentNo}</td>
                <td class='text-start'>${myStudents[index].fullName}</td>
                <td>${temp_json.code}</td>
                <td>${temp_json.description}</td>
                <td>${myStudents[index].section}</td>
                <td>${parseFloat(temp_json.grade).toFixed(2)}</td>
                <td class='fw-bold'>${parseFloat(temp_json.equiv).toFixed(2)}</td>
            </tr>`;
            $("#dropStudentContent").append(content);
        }
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

    function isPassed(stud) {
        var grades = [];
        // console.log(stud);
        $.each(stud.subjects, function (indexInArray, sub2) {
            if (stud.level.charAt(0) == sub2.level)
                grades.push(sub2.grade);
        });
        if (parseFloat(getGrade(grades)) >= 75) {
            return true;
        }
        return false;
    }

    function getGrade(arr) {
        return arr.reduce((a, b) => parseFloat(a) + parseFloat(b)) / arr.length
    }

    function displayPassingRatePerSubject() {
        $.ajax({
            type: "POST",
            url: "../dashboard/process.dashboard.php",
            data: { GET_ALL_SUBJECTS_REQ: true },
            dataType: "JSON",
            success: function (response) {
                allSubjects = response;
                getGradePerYearSem($("#year_sem").val());
            },
            error: function (response) {
                console.error(response);
                $("#errorLog").html(response.responseText);
            },
            beforeSend: function (response) {
                $("#chart3Spinner").fadeIn();
            }
        });
    }

    $("#year_sem").change(function (e) {
        e.preventDefault();
        $("#chart3Spinner").fadeIn();
        getGradePerYearSem($(this).val());
    });

    function getGradePerYearSem(year) {
        var subjectsPerLevel = [];
        var filteredSubject = allSubjects.filter(function (data) {
            return data.year_level == year;
        });
        $.each(filteredSubject, function (indexInArray, sub) {
            subjectsPerLevel.push(sub.code);
        });
        var ratePerSubject = [];
        var len = subjectsPerLevel.length;
        for (let i = 0; i < len; i++) {
            ratePerSubject.push(0);
        }
        $.each(myStudents, function (indexInArray, student) {
            if (year == student.level.charAt(0)) {
                $.each(subjectsPerLevel, function (ind, subject) {
                    $.each(student.subjects, function (indexInArray, sub) {
                        if (sub.code == subject) {
                            if (sub.grade >= 75) {
                                ratePerSubject[ind]++;
                            }
                        }

                    });
                });
            }
        });
        for (let x = 0; x < len; x++) {
            ratePerSubject[x] = ratePerSubject[x] / yearLevelCount[year - 1] * 100;
        }
        chart3.data.labels = subjectsPerLevel;
        chart3.data.datasets[0].data = ratePerSubject;
        chart3.update();
        $("#chart3Spinner").fadeOut();
    }

    function candidateForAcademicHonor(stud, honorCtr) {
        var grades = [];

        $.each(stud.subjects, function (indexInArray, sub2) {
            grades.push(parseFloat(sub2.grade));
        });
        var grade = parseFloat(getGrade(grades));

        if (!grades.some((x) => { return x < 85; })) {
            if (grade >= 95) {
                honorCtr[0]++;
            }
        } else if (!grades.some((x) => { return x <= 82; })) {
            if (grade >= 92) {
                honorCtr[1]++;
            }
        } else if (!grades.some((x) => { return x <= 79; })) {
            if (grade >= 88) {
                honorCtr[2]++;
            }
        }
        return honorCtr;
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

// CHART #6: NUMBER OF ACADEMIC EXCELLENCE AWARD
var ctxChart6 = document.getElementById('chart6').getContext('2d');
var chart6 = new Chart(ctxChart6, {
    type: 'doughnut',
    data: {
        labels: ["President's List", "Dean's List"],
        datasets: [{
            data: [],
            backgroundColor: ['#eeb902', '#76320d'],
        }]
    }, options: {
        plugins: {
            legend: { display: false },
            title: { display: false }
        }
    },
});

// CHART #5: NUMBER OF ACADEMIC HONORS
var ctxChart5 = document.getElementById('chart5').getContext('2d');
var chart5 = new Chart(ctxChart5, {
    type: 'doughnut',
    data: {
        labels: ["Summa Cum Laude", "Magna Cum Laude", "Cum Laude"],
        datasets: [{
            data: [],
            backgroundColor: ['#eeb902', '#f79c06', '#bb7e00', '#76320d'],
        }]
    }, options: {
        plugins: {
            legend: { display: false },
            title: { display: false }
        }
    },
});

// CHART #4: GENDER RATE PER YEAR LEVEL
var ctxChart4 = document.getElementById('chart4').getContext('2d');
var chart4 = new Chart(ctxChart4, {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
        labels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        datasets: [{
            label: ["Male"],
            data: [87, 97, 76, 84],
            backgroundColor: '#f79c06',
        }, {
            label: ["Female"],
            data: [56, 30, 74, 96],
            backgroundColor: '#76320d'
        }]
    }, options: {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'bottom',
                color: 'white'
            }
        }, scales: {
            // y: { min: 0, max: 100 }
        }
    },
});

// CHART #3: PASSING RATE PER SUBJECT
var ctxChart3 = document.getElementById('chart3').getContext('2d');
var chart3 = new Chart(ctxChart3, {
    type: 'line',
    plugins: [ChartDataLabels],
    data: {
        labels: ["IT 107", "PCM 101", "MMW 101", "UTS 101", "PAL101", "PE 11", "NSTP 11"],
        datasets: [{
            label: ["Passed"],
            data: [87, 97, 76, 84, 67, 84, 94],
            backgroundColor: ['#eeb90215'],
            // borderColor: 'gray',
            fill: true,
            tension: 0.4
        }
        ]
    }, options: {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            datalabels: {
                display: false
                // anchor: 'start',
                // align: 'bottom',
                // color: 'black'
            }
        }, scales: {
            y: { min: 0, max: 100 }
        },
        pointBackgroundColor: "#eeb902",
        radius: 5,
    },
});


// CHART #2: PASSING RATE PER YEAR LEVEL
var ctxChart2 = document.getElementById('chart2').getContext('2d');
var chart2 = new Chart(ctxChart2, {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
        labels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        datasets: [{
            label: ["Passed"],
            data: [87, 97, 76, 84],
            backgroundColor: '#f79c06',
        }, {
            label: ["Failed"],
            data: [13, 3, 24, 16],
            backgroundColor: '#76320d'
        }]
    }, options: {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'bottom',
                color: 'white'
            }
        }, scales: {
            y: { min: 0, max: 100 }
        }
    },
});

// CHART #1: NUMBER OF STUDENT PER  YEAR LEVEL
var ctxChart1 = document.getElementById('chart1').getContext('2d');
var chart1 = new Chart(ctxChart1, {
    type: 'doughnut',
    data: {
        labels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        datasets: [{
            data: [],
            backgroundColor: ['#eeb902', '#f79c06', '#bb7e00', '#76320d'],
        }]
    }, options: {
        plugins: {
            legend: { display: false },
            title: { display: false }
        }
    },
});
