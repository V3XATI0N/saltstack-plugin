<?php

$minion = $api_path[3];
if (empty($api_path[4])) {
    apiDie('invalid.', 405);
}
$mod = $api_path[4];
if (file_exists(__DIR__ . '/' . $mod . '/POST.php')) {
    include(__DIR__ . '/' . $mod . '/POST.php');
} else {
    foreach ($plugins as $pluginName => $pluginConf) {
        if (file_exists($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php')) {
            include($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php');
        }
    }
    apiDie('no', 405);
}