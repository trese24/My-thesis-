<?php
include '../../include/autoloader.inc.php';
if (!isset($_SESSION[ADMIN])) {
    echo true;
    exit();
}

$admin = new Admin($_SESSION[ADMIN]);

// PROFILE
if (isset($_POST['getInfo'])) {
    echo json_encode((array)$admin->getInfo());
} elseif (isset($_POST['setInfo'])) {
    $info = $admin->getInfo();
    if ($_POST['password'] == $info->password) {
        if (isset($_POST['newPassword'])) {
            $newPassword = $_POST['newPassword'];
            if ($newPassword == $_POST['confirmPassword']) {
                $admin->setPassword($newPassword);
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
        echo json_encode((array) $admin->setInfo($newInfo));
    } else {
        echo json_encode(array(
            "status" => false,
            "msg" => 'Incorrect Password!'
        ));
    }
}
