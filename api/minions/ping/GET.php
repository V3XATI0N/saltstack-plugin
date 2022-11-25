<?php

$minion = $api_path[3];
$call = [
    'client' => 'local',
    'tgt' => $minion,
    'tgt_type' => 'glob',
    'fun' => 'test.ping'
];
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
if ($data[$minion] === true) {
    apiDie(true, 200);
} else {
    apiDie(false, 410);
}