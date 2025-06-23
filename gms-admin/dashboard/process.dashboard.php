<?php
include '../../include/autoloader.inc.php';

$student = new Student();
$subject = new Subject();

if (isset($_POST['GET_STUDENTS_REQ'])) {
	echo json_encode((array)$student->getStudentInfo());
} elseif (isset($_POST['GET_ALL_SUBJECTS_REQ'])) {
    echo json_encode((array)$subject->getAllSubject());
}
