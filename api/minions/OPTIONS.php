<?php

if (empty($api_path[4])) {
    $minionStatOpts = getMinionStatOpts();
    $minionOpts = parse_file($oset['file_root'] . '/plugins/salt/utils/minion_options.json');
    $minionOpts['status_items'] = $minionStatOpts;
    $minionOpts['minion_modules'] = getMinionMods();
    apiDie($minionOpts, 200);
} else {
    if (file_exists(__DIR__ . '/' . $api_path[4] . '/OPTIONS.php')) {
        include(__DIR__ . '/' . $api_path[4] . '/OPTIONS.php');
    } else {
        foreach ($plugins as $pluginName => $pluginConf) {
            if (file_exists($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php')) {
                include($pluginConf['file_root'] . '/salt_api_extensions/minions/' . $api_path[4] . '/' . $api_method . '.php');
            }
        }
        apiDie('huh? ' . $api_path[4], 405);
    }
}