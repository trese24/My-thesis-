<?php
include '../../include/autoloader.inc.php';

$criteria = new Criteria();

if (isset($_POST['GET_CRITERIA_REQ'])) {
    echo json_encode((array)$criteria->getCriteria());
} else if (isset($_POST['UPDATE_CRITERIA_REQ'])) {
	$data = $_POST["criteria"];
    echo json_encode((array)$criteria->updateCriteria($data));
} else if (isset($_POST['REMOVE_CRITERIA_REQ'])) {
    echo json_encode((array)$criteria->removeCriteria($_POST['id']));
} 

