<?php
include '../include/autoloader.inc.php';

if (isset($_POST['login'])) {
    $userType = $_POST['login'];
    $login = new Login($userType, $_POST['username'], $_POST['password']);
    echo json_encode((array)$login->getResponse());
} elseif (isset($_POST['forgot-password'])) {
    $userType = $_POST['forgot-password'];
    if (ENABLE_MAIL) {
        $mail = new Mail($userType);
        echo json_encode((array)$mail->sendNewPassword($_POST['email']));
    }
}
