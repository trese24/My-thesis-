<?php
include '../../include/autoloader.inc.php';
if (!isset($_SESSION[DEPTHEAD])) {
    echo true;
    exit();
}

$depthead = new depthead($_SESSION[DEPTHEAD]);

// PROFILE
if (isset($_POST['getInfo'])) {
    echo json_encode((array)$depthead->getInfo());
} elseif (isset($_POST['setInfo'])) {
    $info = $depthead->getInfo();
    if ($_POST['password'] == $info->password) {
        if (isset($_POST['newPassword'])) {
            $newPassword = $_POST['newPassword'];
            if ($newPassword == $_POST['confirmPassword']) {
                $depthead->setPassword($newPassword);
            } else {
                echo json_encode(array(
                    "status" => false,
                    "msg" => 'Incorrect Password!'
                ));
                exit();
            }
        }
        $newInfo = (object) [
            'username' => $_POST['username'],
            'email' => $_POST['email'],
        ];
        echo json_encode((array) $depthead->setInfo($newInfo));
    } else {
        echo json_encode(array(
            "status" => false,
            "msg" => 'Incorrect Password!'
        ));
    }
}
