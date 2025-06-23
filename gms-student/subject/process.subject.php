<?php
include '../../include/autoloader.inc.php';
$studentNo = $_SESSION['student'];
$subject = new Subject($studentNo);
if (isset($_POST['GET_ALL_SUBJECTS_REQ'])) {
    echo json_encode((array)$subject->getAllSubject());
}
