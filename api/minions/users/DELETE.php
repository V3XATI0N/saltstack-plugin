<?php
if (empty($api_path[5])) {
    apiDie("you can't just delete ALL the users.", 400);
} else {
    if (empty($api_path[6])) {
        apiDie('deleting users not yet supported, sorry', 400);
    } else {
        if (file_exists(__DIR__ . '/' . $api_path[6] . '/' . $api_method . '.php')) {
            include(__DIR__ . '/' . $api_path[6] . '/' . $api_method . '.php');
            die();
        } else {
            apiDie('nope', 405);
        }
    }
}
