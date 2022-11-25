<?php
$minion = $api_path[3];
if (file_exists(__DIR__ . '/' . $api_path[4] . '/PATCH.php')) {
    include(__DIR__ . '/' . $api_path[4] . '/PATCH.php');
} else {
    foreach ($plugins as $pluginName => $pluginConf) {
        if (file_exists($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php')) {
            include($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php');
        }
    }
    apiDie('no method here', 405);
}