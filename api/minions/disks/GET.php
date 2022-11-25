<?php

if (!empty($api_path[5])) {
    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'disk.usage'
    ];
    $data = json_decode(saltCall($call), true)['return'][0];
    if (empty($data[$minion])) {
        apiDie('whoops', 500);
    }
    foreach ($data[$minion] as $dName => $dConf) {
        if ($dName == urldecode($api_path[5])) {
            apiDie($dConf, 200);
        }
    }
    apiDie('huh?', 404);
} else {

    $call = [
        'client' => 'local',
        'tgt' => $minion,
        'fun' => 'disk.usage'
    ];
    $return = [];
    $data = json_decode(saltCall($call), true)['return'][0];
    if (empty($data[$minion])) {
        apiDie('whoops', 500);
    }
    foreach ($data[$minion] as $mountName => $mountConf) {
        $use = true;
        switch ($mountConf['filesystem']) {
            case "tmpfs":
            case "run":
            case "dev":
                $use = false;
        }
        if (preg_match('/^\/(var|dev)\/loop.*$/', $mountConf['filesystem'])) {
            $use = false;
        }
        if ($use === true) {
            $return[$mountName] = $mountConf;
        }
    }
    ksort($return);
    apiDie($return, 200);
}