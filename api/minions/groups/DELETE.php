<?php

$minion = $api_path[3];
if (empty($api_path[5])) { apiDie('specify group name.', 400); }
$group = $api_path[5];
if (empty($api_path[6])) {
    // delete entire group
    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'group.delete',
        'kwarg' => [
            'name' => urldecode($group)
        ]
    ];
} else {
    $user = $api_path[6];
    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'group.deluser',
        'kwarg' => [
            'name' => $group,
            'username' => urldecode($user)
        ]
    ];
}
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
apiDie($data, 200);
