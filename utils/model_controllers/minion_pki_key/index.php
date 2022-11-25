<?php

$modelAction = $api_method;

if (file_exists(__DIR__ . '/' . $modelAction . '.php')) {
    include(__DIR__ . '/' . $modelAction . '.php');
} else {
    return false;
}