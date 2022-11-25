<?php
$kernel = $api_data['kernel'];
if (isset($api_data['update_all']) and $api_data['update_all'] === true) {
    switch ($kernel) {
        case "Windows":
            apiDie('oops! win_wua has no such facility', 400);
            break;
        case "Darwin":
            $fun = "probably nothing idk";
            break;
        case "SunOS":
            $fun = "who actually knows?";
            break;
        case "Linux":
        default:
            $fun = "pkg.upgrade";
    }
} else {
    switch ($kernel) {
        case "Windows":
            $fun = "win_wua.install";
            $kwarg = [
                "names" => $api_data['names']
            ];
            break;
        case "Darwin":
            $fun = "probably nothing idk";
            break;
        case "SunOS":
            $fun = "who actually knows?";
            break;
        case "Linux":
        default:
            $fun = "pkg.install";
            $kwarg = [
                "pkgs" => $api_data['names'],
                "skip_verify" => true
            ];
    }
}

$call = [
    'client' => 'local_async',
    'tgt' => $minion,
    'fun' => $fun
];
if (isset($kwarg)) {
    $call['kwarg'] = $kwarg;
}

$data = json_decode( saltCall( $call ), true)['return'][0];
if (isset($data['jid'])) {
    apiDie(["jid"=>$data['jid']], 200);
} else {
    apiDie('error', 500);
}
