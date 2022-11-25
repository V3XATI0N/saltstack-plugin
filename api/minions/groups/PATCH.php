<?php

$minion = $api_path[3];
$group = $api_path[5];
if (empty($api_path[6])) { apiDie('specify parameter', 400); }
$param = $api_path[6];

$call = [
    'client' => 'local',
    'tgt' => $minion,
    'kwarg' => [
        'name' => $group
    ]
];

$actionKernel = $api_data['kernel'];
$actionData = $api_data['data'];

switch ($param) {
    case "members": {
        $call['fun'] = 'group.members';
        $call['kwarg']['members_list'] = implode(',', $actionData);
    }
}

$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
apiDie($data, 200);