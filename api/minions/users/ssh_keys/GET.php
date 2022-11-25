<?php
$call = [
    "client" => "local",
    "tgt" => $minion,
    "fun" => "ssh.auth_keys",
    "arg" => $api_path[5]
];
$data = json_decode(saltCall($call), true)['return'][0];
apiDie($data, 200);