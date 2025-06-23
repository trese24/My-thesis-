<?php
include '../../include/autoloader.inc.php';
$studentNo = $_SESSION[STUDENT];
$student = new Student($studentNo);
if (isset($_POST["GET_STUDENT_GRADES_REQ"])) {
    echo json_encode((array)$student->getStudentInfo()[0]);
}
