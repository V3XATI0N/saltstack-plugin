<?php

if (empty($api_path[3])) { 
    if (file_exists(__DIR__ . '/' . $api_method . '.php')) {
        include(__DIR__ . '/' . $api_method . '.php');
    } else {
        apiDie('no such method', 405);
    }
} else {
    $mod = $api_path[3];
    $modDir = __DIR__ . '/' . $mod;
    if (file_exists($modDir . '/' . $api_method . '.php')) {
        include($modDir . '/' . $api_method . '.php');
    } else {
        foreach ($plugin as $pluginName => $pluginConf) {
            $pluginDir = $pluginConf['file_root'];
            $saltExtDir = $pluginDir . '/salt_api_extensions/console/' . $mod;
            if (file_exists($saltExtDir . '/' . $api_method . '.php')) {
                include($saltExtDir . '/' . $api_method . '.php');
            }
        }
        apiDie('no.', 405);
    }
}