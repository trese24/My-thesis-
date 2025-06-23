<?php
include '../../include/autoloader.inc.php';

$faculty = new Faculty();
if (isset($_POST['GET_FACULTIES_REQ'])) {
	echo json_encode((array)$faculty->getFacultyInfo());
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
	echo json_encode((array)$faculty->addFacultyFromFile($_POST['uploadFileToDB']));
} elseif (isset($_POST['ADD_FACULTY_REQ'])) {
	$sub_sec = array();
	for ($i = 1; $i <= $_POST["subCtr"]; $i++) {
		$sub_sec[] = (object) ['subject' => $_POST["subject"][$i], 'sections' => $_POST["sections"][$i]];
	}
	$details = (object) [
		'id' => $_POST['add-facultyNo'],
		'fullName' => strtoupper($_POST['add-lastName']) . ", " . $_POST['add-firstName'] . " " . $_POST['add-middleName'],
		'email' => $_POST['add-email'],
		'contactNo' => $_POST['add-contactNo'],
		'sub_sec' => $sub_sec,
	];
	echo json_encode((array)$faculty->addNewFaculty($details));
} elseif (isset($_POST['EDIT_FACULTY_REQ'])) {
	$sub_sec = array();
	for ($i = 1; $i <= $_POST["edit-subCtr"]; $i++) {
		$sub_sec[] = (object) ['subject' => $_POST["edit-subject"][$i], 'sections' => $_POST["edit-sections"][$i]];
	}
	$details = (object) [
		'id_old' => $_POST['edit-oldFacultyID'],
		'id' => $_POST['edit-facultyID'],
		'fullName' => $_POST['edit-fullName'],
		'email' => $_POST['edit-email'],
		'contactNo' => $_POST['edit-contactNo'],
		'sub_sec' => $sub_sec,
	];
	echo json_encode((array)$faculty->editFaculty($details));
} elseif (isset($_POST['REMOVE_FACULTY_REQ'])) {
	echo json_encode((array)$faculty->removeFaculty($_POST["REMOVE_FACULTY_REQ"]));
} elseif (isset($_POST['GET_BLOCKED_FACULTY_REQ'])) {
	
} elseif (isset($_POST['UNBLOCK_FACULTY_REQ'])) {
	echo json_encode((array)$faculty->unblockFaculty($_POST['UNBLOCK_FACULTY_REQ']));
}
