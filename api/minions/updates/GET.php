<?php

$grains = getMinionFromCache($minion);
if (empty($grains['kernel'])) {
    apiDie('error', 500);
}
$kernel = $grains['kernel'];

switch ($kernel) {
    case "Windows":
        $call = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'win_wua.available'
        ];
        break;
    case "SunOS":
        break;
    case "Darwin":
        break;
    case "Linux":
    default:
        $call = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'pkg.list_upgrades'
        ];
}

$data = json_decode( saltCall( $call ), true )['return'][0][$minion];
ksort($data);
apiDie($data, 200);
