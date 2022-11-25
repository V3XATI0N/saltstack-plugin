<?php

if (empty($api_path[5])) { apiDie('specify module.', 400); }
$minion = $api_path[4];
$mods = getMinionMods();
$modName = $api_path[5];

foreach ($mods as $modConf) {
    if ($modConf['href'] == $modName) {
        if (isset($modConf['plugin'])) {
            $modPath = $plugins[$modConf['plugin']]['file_root'] . $modConf['path'];
        } else {
            $modPath = $oset['file_root'] . '/plugins/salt/' . $modConf['path'];
        }
        if (file_exists($modPath . '/access.json') and file_exists($modPath . '/' . $api_method . '.php')) {
            $modAccess = parse_file($modPath . '/access.json')['methods'];
            if (!accessMatch($_SESSION['id'], $modAccess[$api_method])) {
                apiDie('unauthorized.', 403);
            }
            ob_start();
            include($modPath . '/' . $api_method . '.php');
            $htmlData = ob_get_clean();
            $retData = [
                "html" => $htmlData
            ];
            if (file_exists($modPath . '/GET.js')) {
                ob_start();
                include($modPath . '/GET.js');
                $jsData = ob_get_clean();
                $retData['js'] = $jsData;
            }
            apiDie($retData, 200);
        } else {
            apiDie('missing module configuration', 501);
        }
    }
}
apiDie('no such module.', 404);
