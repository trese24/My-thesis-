<?php
include '../../include/autoloader.inc.php';

$grade = new Grade();
$student = new Student();
$faculty = new Faculty($_SESSION[FACULTY]);

if (isset($_POST['GET_FACULTY_REQ'])) {
	echo json_encode((array)$faculty->getFacultyInfo()[0]);
} elseif(isset($_POST["GET_STUDENT_GRADES_REQ"])) {
    echo json_encode((array)$student->getStudentInfo());
} elseif (isset($_FILES['fileUpload'])) {
	$fileName = $_FILES['fileUpload']['tmp_name'];
	if ($xlsx = SimpleXLSX::parse("$fileName")) {
		$dim = $xlsx->dimension();
		$cols = $dim[0];
		echo json_encode((array)$xlsx->rows());
	} else {
		echo SimpleXLSX::parseError();
	}
} elseif (isset($_POST['UPDATE_CLASS_RECORD_REQ'])) {
	echo json_encode((array)$grade->updateClassRecord($_POST['UPDATE_CLASS_RECORD_REQ']));
} elseif (isset($_POST['UPDATE_DROP_STATUS_REQ'])) {
	echo json_encode((array)$grade->updateDropStatus($_POST['studentNo'], $_POST['subject'], $_POST['status']));
}
