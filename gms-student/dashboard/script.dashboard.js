$(document).ready(function () {
    $("#hasHonor").hide();
    $.ajax({
        type: "POST",
        url: "../dashboard/process.dashboard.php",
        data: { GET_STUDENT_GRADES_REQ: true },
        dataType: "JSON",
        success: function (GET_STUDENT_GRADES_RESP) {
            // console.log(GET_STUDENT_GRADES_RESP);
            studentGrades(GET_STUDENT_GRADES_RESP.subjects);
            $("#loadingScreen").modal("hide");
        }, error: function (response) {
            console.error(response);
        }, beforeSend: function (response) {
            $("#loadingScreen").modal("show");
        }
    });

    function studentGrades(subjects) {
        var grades = [];
        var gradesPerLevel = [];
        var obj = subjects,
            groupByYear = obj.reduce(function (r, a) {
                r[a.level] = r[a.level] || [];
                r[a.level].push(a);
                return r;
            }, Object.create(null));

        getSubjectPerLevel(groupByYear);

        $.each(groupByYear, function (indexInArray, year) {
            var tempGrade = [];
            $.each(year, function (indexInArray, val) {
                tempGrade.push(val.grade);
            });
            gradesPerLevel.push(getEquiv(getGrade(tempGrade)).toFixed(2));
        });

        // CHART #1
        chart1.data.datasets[0].data = gradesPerLevel;
        chart1.update();

        $("#year_sem").change(function (e) {
            e.preventDefault();
            getSubjectPerLevel(groupByYear);
        });

        var lock = 0;
        var total = 0;
        $.each(subjects, function (subjectIndex, subject) {
            grades.push(subject.grade);
            $.each(subject.criteria, function (indexInArray, criteria) {
                $.each(criteria.activities, function (indexInArray, act) {
                    act.isLock = (String(act.isLock) === 'true');
                    if (act.isLock) lock++;
                    total++;
                });
            });
        });
        var prog = (lock / total) * 100;
        $("#studentProgress").width(prog + "%");
        displayGWA(grades);
        candidateForAcademicHonor(grades);
    }  // END OF studentGrades 

    function getSubjectPerLevel(subLevel) {
        var level = $("#year_sem").val();
        var subCode = [];
        var subGrade = [];
        $.each(subLevel[level], function (indexInArray, val) {
            subCode.push(val.code);
            subGrade.push(getEquiv(val.grade).toFixed(2));
        });
        chart2.data.labels = subCode;
        chart2.data.datasets[0].data = subGrade;
        chart2.update();
    }

    function displayGWA(grades) {
        const finalGrade = getGrade(grades);
        $("#gwa-grade").html(getGrade(grades).toFixed(2));
        $("#gwa-equiv").html(getEquiv(finalGrade).toFixed(2));
        $("#gwa-remarks").html(getRemarks(finalGrade));
    }

    function candidateForAcademicHonor(grades) {
        const finalGrade = getGrade(grades);
        if (!grades.some((x) => { return x < 85; })) {
            if (finalGrade >= 95) {
                $("#academicHonor").html("Summa Cum Laude");
                $("#qoute").fadeOut();
                $("#hasHonor").fadeIn();
            }
        } else if (!grades.some((x) => { return x <= 82; })) {
            if (finalGrade >= 92) {
                $("#academicHonor").html("Magna Cum Laude");
                $("#qoute").fadeOut();
                $("#hasHonor").fadeIn();
            }
        } else if (!grades.some((x) => { return x <= 79; })) {
            if (finalGrade >= 88) {
                $("#academicHonor").html("Cum Laude");
                $("#qoute").fadeOut();
                $("#hasHonor").fadeIn();
            }
        }
    }

    function getGrade(arr) {
        return arr.reduce((a, b) => parseFloat(a) + parseFloat(b)) / arr.length
    }

    function getRemarks(grade) {
        if (grade < 75) {
            return "FAILED";
        } else {
            return "PASSED";
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

// CHART #1: GRADE PER YEAR LEVEL
var ctxChart1 = document.getElementById('chart1').getContext('2d');
var chart1 = new Chart(ctxChart1, {
    type: 'line',
    plugins: [ChartDataLabels],
    data: {
        labels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        datasets: [{
            label: ["Grade"],
            data: [2.0, 1.25, 1.75, 1.50],
            backgroundColor: ['#eeb90215'],
            borderColor: '#eeb902',
            fill: true,
            tension: 0.4
        }]
    }, options: {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            datalabels: {
                anchor: 'start',
                align: 'bottom',
                color: 'black'
            }
        }, scales: {
            y: { min: 1, max: 5, reverse: true },
        },
        pointBackgroundColor: "#eeb902",
        radius: 7,
    },
});

// CHART #2: GRADE PER SUBJECT
var ctxChart2 = document.getElementById('chart2').getContext('2d');
var chart2 = new Chart(ctxChart2, {
    type: 'line',
    plugins: [ChartDataLabels],
    data: {
        labels: ["IT 107", "PCM 101", "MMW 101", "UTS 101", "PAL101", "PE 11", "NSTP 11"],
        datasets: [{
            data: [87, 97, 76, 84, 67, 84, 94],
            backgroundColor: ['#eeb90215'],
            borderColor: '#eeb902',
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
                anchor: 'start',
                align: 'bottom',
                color: 'black'
            }
        }, scales: {
            y: {
                min: 1,
                max: 5,
                reverse: true
            },
        },
        pointBackgroundColor: "#eeb902",
        radius: 7,
    },
});

