<?php

$minion = $api_path[3];
$user_name = $api_path[5];
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
    default:
        if (is_array($actionData)) {
            $paramData = implode(',', $actionData);
        } else {
            $paramData = $actionData;
        }
        $call['fun'] = 'user.ch' . $param;
        $call['kwarg'] = [
            'name' => $user_name,
            $param => $paramData
        ];
}

$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
apiDie($data, 200);
