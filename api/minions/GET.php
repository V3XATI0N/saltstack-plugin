<?php
if (empty($api_path[3])) {
    $minions = listMinionsFromCache(false);
    apiDie($minions, 200);
} else {
    if (empty($api_path[4])) {
        $minion = $api_path[3];
        $minionData = getMinionFromCache($minion);
        if ($minionData === false) {
            apiDie($minion . ' not found', 404);
        }
        apiDie($minionData, 200);
    } else {
        if (file_exists(__DIR__ . '/' . $api_path[4] . '/' . $api_method . '.php')) {
            $minion = $api_path[3];
            include(__DIR__ . '/' . $api_path[4] . '/' . $api_method . '.php');
        } else {
            foreach ($plugins as $pluginName => $pluginConf) {
                if (file_exists($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php')) {
                    include($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php');
                }
            }
            apiDie('no such method', 405);
        }
    }
}