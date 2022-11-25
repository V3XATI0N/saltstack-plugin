<?php
if (empty($api_path[5])) {
    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'user.list_users'
    ];
} else {
    if (empty($api_path[6])) {
        $call = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'user.info',
            'arg' => $api_path[5]
        ];
    } else {
        if (file_exists(__DIR__ . '/' . $api_path[6] . '/' . $api_method . '.php')) {
            include(__DIR__ . '/' . $api_path[6] . '/' . $api_method . '.php');
            die();
        }
    }
}
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0][$minion];
if (empty($api_path[5])) {
    $data = array_unique($data);
}
if (isset($api_path[6])) {
    if (isset($data[$api_path[6]])) {
        apiDie($data[$api_path[6]], 200);
    } else {
        apiDie('nothing here', 404);
    }
} else {
    apiDie($data, 200);
}