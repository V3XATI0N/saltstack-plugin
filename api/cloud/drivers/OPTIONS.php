<?php

if (empty($api_path[4])) {
    apiDie('specify driver please', 400);
}

$driver = $api_path[4];

if (file_exists(__DIR__ . '/../../../utils/cloud_drivers/' . $driver . '.json')) {
    $drvdef = parse_file(__DIR__ . '/../../../utils/cloud_drivers/' . $driver . '.json');
    apiDie($drvdef, 200);
} else {
    foreach ($plugins as $pluginName => $pluginConf) {
        $pdir = $pluginConf['file_root'];
        if (file_exists($pdir . '/salt_cloud_drivers/' . $driver . '.json')) {
            $drvdef = parse_file($pdir . '/salt_cloud_drivers/' . $driver . '.json');
            apiDie($drvdef, 200);
        }
    }
    apiDie('no driver defined for ' . $driver, 501);
}