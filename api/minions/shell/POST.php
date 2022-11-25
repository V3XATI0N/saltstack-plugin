<?php
$minion = $api_path[3];
$cmd = $api_data['cmd'];
$async = $api_data['async'];
$bg = $api_data['bg'];
$shell = $api_data['shell'];
$kernel = $api_data['kernel'];
if (isset($oset['salt_minion_shell_use_vt']) and $kernel != "Windows") {
    $use_vt = $oset['salt_minion_shell_use_vt'];
} else {
    $use_vt = false;
}
if (isset($api_data['use_vt'])) {
    $use_vt = $api_data['use_vt'];
}
if ($async === true) {
    $client = "local_async";
} else {
    $client = "local";
}

$call = [
    "client" => $client,
    "tgt" => $minion,
    "fun" => "cmd.run",
    "kwarg" => [
        "cmd" => $cmd,
        "shell" => $shell,
        "use_vt" => $use_vt
    ]
];
if ($kernel != "Windows") {
    if (isset($api_data['user'])) {
        $call['kwarg']['runas'] = $api_data['user'];
    } else {
        $api_data['user'] = "root";
    }
    $call['kwarg']['cmd'] .= ' 2>&1';
} else {
    $api_data['user'] = "Administrator";
}

require_once(__DIR__ . '/../../../utils/AnsiToHtmlConverter.php');
require_once(__DIR__ . '/../../../utils/AnsiToHtmlConverterTheme.php');
use SensioLabs\AnsiConverter\AnsiToHtmlConverter;

$exec = saltCall($call);
// logError($exec);
$exec_data = json_decode($exec, true);
if ($exec_data === null) {
    apiDie(['error','message'=>$exec], 500);
}
$data = $exec_data['return'][0];
if ($kernel != "Windows" && $use_vt === true) {
    $out = [];
    foreach ($data as $md => $mr) {
        $c = new AnsiToHtmlConverter();
        $out[$md] = $c->convert($mr);
    }
    $data = $out;
} else {
    $out = [];
    foreach ($data as $md => $mr) {
        $out[$md] = $mr;
    }
    $data = $out;
}

apiDie(["response" => $data, "options" => $api_data, "return" => $exec_data], 200);