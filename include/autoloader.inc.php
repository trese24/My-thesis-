<?php
session_start();

include("constant.handler.php");
spl_autoload_register(function ($className) {
    $path = "classes/";
    $ext = ".class.php";
    $fullPath = $path . $className . $ext;
    $limit = 5;
    if ($className == 'Mail') include("vendor/autoload.php");
    while (!file_exists($fullPath) && $limit > 0) {
        $fullPath = '../' . $fullPath;
        $limit--;
    }
    include_once $fullPath;
});
