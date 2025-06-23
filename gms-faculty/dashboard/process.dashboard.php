<?php
include '../../include/autoloader.inc.php';

$facultyID = $_SESSION[FACULTY];
$student = new Student();
$faculty = new Faculty($facultyID);

if (isset($_POST['GET_FACULTY_REQ'])) {
	echo json_encode((array)$faculty->getSubjectSection($facultyID));
} elseif (isset($_POST['GET_STUDENTS_REQ'])) {
	echo json_encode((array)$student->getHandledStudent($facultyID));
}
