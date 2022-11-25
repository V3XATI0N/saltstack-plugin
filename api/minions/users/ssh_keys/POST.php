<?php

if (empty($api_data['comment']) or empty($api_data['key'])) {
    apiDie('insufficient information, try again.', 400);
}
$minion = $api_path[3];
$user = $api_path[5];

$keyData = explode(' ', $api_data['key']);
if (!isset($keyData[1])) {
    apiDie('invalid key data.', 400);
}
switch ($keyData[0]) {
    case "ssh-rsa":
        $keyEnc = "rsa";
        break;
    case "ssh-dss":
        $keyEnc = "dss";
        break;
    case "ssh-ecdsa":
        $keyEnc = "ecdsa";
        break;
    case "ssh-ed25519":
        $keyEnc = "ed25519";
        break;
    default:
        apiDie('please use ssh-rsa, ssh-ed25519, ssh-ecdsa, or ssh-dss.', 400);
}
$pubKey = $keyData[1];

$call = [
    "client" => "local",
    "tgt" => $minion,
    "fun" => "ssh.set_auth_key",
    "kwarg" => [
        "user" => $user,
        "key" => $pubKey,
        "enc" => $keyEnc,
        "comment" => $api_data['comment']
    ]
];
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
apiDie($data, 200);