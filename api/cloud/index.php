<?php

if (file_exists(__DIR__ . '/' . $api_path[3] . '/index.php')) {
    include(__DIR__ . '/' . $api_path[3] . '/index.php');
} else {
    apiDie(['nope, sorry', $api_path], 405);
}