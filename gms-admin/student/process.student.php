<?php
include '../../include/autoloader.inc.php';

$student = new Student();
if (isset($_POST['GET_STUDENTS_REQ'])) {
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
} elseif (isset($_POST['uploadFileToDB'])) {
	echo json_encode((array)$student->addStudentFromFile($_POST['uploadFileToDB']));
} elseif (isset($_POST['ADD_STUDENT_REQ'])) {
	$details = (object) [
		'id' => $_POST['add-studentNo'],
		'fullName' => strtoupper($_POST['add-lastName']) . ", " . $_POST['add-firstName'] . " " . $_POST['add-middleName'],
		'email' => $_POST['add-email'],
		'contactNo' => $_POST['add-contactNo'],
		'gender' => $_POST['add-gender'],
		'program' => $_POST['add-program'],
		'specialization' => $_POST['add-specialization'],
		'level' => $_POST['add-level'],
		'section' => $_POST['add-section'],
		// 'subjects' => $_POST['add-subjects'],
	];
	echo json_encode((array)$student->addNewStudent($details));
} elseif (isset($_POST['EDIT_STUDENT_REQ'])) {
	$details = (object) [
		'id_old' => $_POST['edit-oldStudentNo'],
		'id' => $_POST['edit-studentNo'],
		'fullName' => $_POST['edit-fullName'],
		'email' => $_POST['edit-email'],
		'contactNo' => $_POST['edit-contactNo'],
		'gender' => $_POST['edit-gender'],
		'program' => $_POST['edit-program'],
		'specialization' => $_POST['edit-specialization'],
		'level' => $_POST['edit-level'],
		'section' => $_POST['edit-section']
	];
	echo json_encode((array)$student->editStudent($details));
} elseif (isset($_POST['GET_PROGRAM_DESTINCT_REQ'])) {
	echo json_encode((array)$student->getDestinctProgram());
} elseif (isset($_POST['GET_SECTION_DESTINCT_REQ'])) {
	echo json_encode((array)$student->getSections($_POST["level"]));
} elseif (isset($_POST['REMOVE_STUDENT_REQ'])) {
	echo json_encode((array)$student->removeStudent($_POST["REMOVE_STUDENT_REQ"]));
} elseif (isset($_POST['GET_BLOCKED_STUDENT_REQ'])) {
	echo json_encode((array)$student->getBlockedStudent());
} elseif (isset($_POST['UNBLOCK_STUDENT_REQ'])) {
	echo json_encode((array)$student->unblockStudent($_POST['UNBLOCK_STUDENT_REQ']));
} elseif (isset($_POST['PROMOTE_YEAR_LEVEL_REQ'])) {
	echo json_encode((array)$student->updateYearLevel(true));
} elseif (isset($_POST['DEMOTE_YEAR_LEVEL_REQ'])) {
	echo json_encode((array)$student->updateYearLevel(false));
} elseif (isset($_POST['GET_ALUMNI_STUDENT_REQ'])) {
	echo json_encode((array)$student->alumniStudent());
} elseif (isset($_POST["GET_STUDENT_GRADES_REQ"])) {
	$studentNo = $_POST["GET_STUDENT_GRADES_REQ"];
	$student = new Student($studentNo);
    echo json_encode((array)$student->getStudentInfo()[0]);
}
