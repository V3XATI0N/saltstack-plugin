<?php
if (empty($api_path[3])) {
    apiDie('specify function', 400);
}

$mod = $api_path[3];

if (file_exists(__DIR__ . '/' . $mod . '/' . $api_method . '.php')) {
    include(__DIR__ . '/' . $mod . '/' . $api_method . '.php');
} elseif (file_exists(__DIR__ . '/' . $api_method . '.php')) {
    include(__DIR__ . '/' . $api_method . '.php');
} else {
    apiDie('no such function', 405);
}