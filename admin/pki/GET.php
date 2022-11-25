<?php

if (isset($api_path[6]) and $api_path[6] != "") {
    $key = getSaltKeys($api_path[6]);
    if (isset($key['data']['return']['minions'][$api_path[6]])) {
        apiDie($key['data']['return']['minions'][$api_path[6]], 200);
    } else {
        apiDie("no such key", 404);
    }
} else {

    $keys = getSaltKeys();

    if (isset($keys['data']['return'])) {
        $keys = $keys['data']['return'];
        $res = [
            "accepted" => $keys['minions'],
            "denied" => $keys['minions_denied'],
            "pending" => $keys['minions_pre'],
            "rejected" => $keys['minions_rejected'],
        ];
        apiDie($res, 200);
    } else {
        apiDie('fail', 500);
    }

}