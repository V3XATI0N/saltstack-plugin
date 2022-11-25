<?php

if (empty($api_path[7])) { apiDie('specify a key, please.', 400); }
if (empty($api_data['key'])) { apiDie('specify the key data.', 400); }
$keyString = explode(' ', $api_data['key'])[1];
$call = [
    'client' => 'local',
    'tgt' => $minion,
    'fun' => 'ssh.rm_auth_key',
    'kwarg' => [
        'user' => $api_path[5],
        'key' => $keyString
    ]
];
$exec = saltCall($call);
$data = json_decode($exec, true);

apiDie($data, 200);