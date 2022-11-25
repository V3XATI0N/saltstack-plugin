<?php

if (empty($api_data['username']) or empty($api_data['password'])) { apiDie('specify the user and pass, duh', 400); }

$u = $api_data['username'];
$p = $api_data['password'];
$test = getSaltToken($u, $p, null, null);

if ($test['result'] === false) {
    apiDie(false, 401);
} else {
    apiDie($test, 200);
}
