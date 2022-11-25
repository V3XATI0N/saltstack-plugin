<?php

$minion = $api_path[3];

if (empty($api_path[5])) {
    $groupData = [];
    $kernel = $api_data['kernel'];
    foreach ($api_data['fields'] as $f => $v) {
        $groupData[$f] = $v;
    }
    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'group.add',
        'kwarg' => $groupData
    ];
    $exec = saltCall($call);
    $data = json_decode($exec, true)['return'][0];
    apiDie($data, 201);
} else {
    if (empty($api_path[6])) {
        apiDie('this is not a valid request', 400);
    }
    // add user (api_path[6]) to group (api_path[5])
}

apiDie([
    $api_data,
    $api_path
], 444);