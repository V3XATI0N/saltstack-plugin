<?php

$minion = $api_path[3];
$call = [
    'client' => 'local',
    'tgt' => $minion,
    'fun' => 'service.get_all'
];
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];

apiDie($data, 200);