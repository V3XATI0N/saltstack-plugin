<?php

$salt_api_per_user = false;
if (isset($oset['salt_api_per_user'])) {
    $salt_api_per_user = $oset['salt_api_per_user'];
}

$opts = [
    "identity" => [
        'salt_api_username' => $_SESSION['userdata']['salt_user'],
        'salt_api_password' => $_SESSION['userdata']['salt_pass']
    ],
    "flags" => [
        'salt_api_per_user' => $salt_api_per_user
    ]
];

apiDie($opts, 200);