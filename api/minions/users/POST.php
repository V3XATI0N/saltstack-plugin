<?php
if (empty($api_path[5])) {
    $minion = $api_path[3];
    $kernel = $api_data['kernel'];
    $createData = [];
    $setPassLater = false;
    foreach ($api_data['fields'] as $f => $v) {
        if ($f == "password" and $kernel != "Windows") {
            $pwGenCall = [
                'client' => 'local',
                'tgt' => $minion,
                'fun' => 'shadow.gen_password',
                'arg' => $v
            ];
            $getPass = json_decode(saltCall($pwGenCall), true)['return'][0][$minion];
            $setPassLater = true;
        } else {
            if (!empty($v)) {
                $createData[$f] = $v;
            }
        }
    }
    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'user.add',
        'kwarg' => $createData
    ];
    $exec = saltCall($call);
    $data = json_decode($exec, true)['return'][0];
    if ($setPassLater === true) {
        $pwCall = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'shadow.set_password',
            'kwarg' => [
                'name' => $api_data['fields']['name'],
                'password' => $getPass
            ]
        ];
        $pwExec = saltCall($pwCall);
        $pwData = json_decode($pwExec, true)['return'][0];
    }
    apiDie([
        'salt_call' => $call,
        'create_user' => $data[$minion],
        'set_password' => $pwData
    ], 201);
} else {
    if (empty($api_path[6])) {
        apiDie('nothing to add here dummy', 400);
    } else {
        if (file_exists(__DIR__ . '/' . $api_path[6] . '/' . $api_method . '.php')) {
            include(__DIR__ . '/' . $api_path[6] . '/' . $api_method . '.php');
            die();
        } else {
            apiDie('nope', 405);
        }
    }
}
