<?php
include '../../include/autoloader.inc.php';

$studentNo = $_SESSION[STUDENT];
$student = new Student($studentNo);

if (isset($_POST['GET_STUDENT_REQ'])) {
	echo json_encode((array)$student->getStudentInfo()[0]);
} elseif (isset($_POST['UPDATE_STUDENT_REQ'])) {
	$details = (object) [
		'id_old' => $studentNo,
		'id' => $studentNo,
		'email' => $_POST['email'],
		'contactNo' => $_POST['contactNo'],
		'username' => $_POST['username'],
		'password' => $_POST['password'],
		'profile' => $_POST['old_profile'],
	];
	if (isset($_POST['newPassword'])) {
		if ($_POST['newPassword'] == $_POST['confirmPassword']) {
			$details->password = $_POST['newPassword'];
		} else {
			echo json_encode(array(
				"status" => false,
				"msg" => 'New Password and Confirm Password does not match'
			));
			exit();
		}
	}
	if (isset($_FILES["profile"]["name"]) && $_FILES["profile"]["error"] == 0) {
		$path = $_FILES['profile']['name'];
		$ext = pathinfo($path, PATHINFO_EXTENSION);
		$file_tmp = $_FILES["profile"]["tmp_name"];
		$img_path = "images/student/" . $studentNo . '.' .$ext;
		$details->profile = $img_path;
		move_uploaded_file($file_tmp, "../../" . $img_path);
	}
	echo json_encode((array)$student->editStudentProfile($details));
}
