<?php

function getMinioniMultiCommands() {
    global $oset;
    global $plugins;
    $modFile = __DIR__ . '/minion_options.json';
    $mods = parse_file($modFile)['minion_list_multi_commands'];
    foreach ($plugins as $pluginName => $pluginConf) {
        if (isset($pluginConf['minion_list_multi_commands'])) {
            foreach ($pluginConf['minion_list_multi_commands'] as $pMod) {
                array_push($mods, $pMod);
            }
        }
    }
    return $mods;
}

function getMinionShellQuickCommands() {
    global $oset;
    global $plugins;
    global $api_models;
    return getModelItems('minion_shell_quick_command', true);
}

function getMinionStatOpts() {
    global $oset;
    global $plugins;
    $modFile = __DIR__ . '/minion_options.json';
    $mods = parse_file($modFile)['status_items'];
    foreach ($plugins as $pluginName => $pluginConf) {
        if (isset($pluginConf['minion_status_items'])) {
            $pmods = $pluginConf['minion_status_items'];
            foreach ($pmods as $pmod) {
                array_push($mods, $pmod);
            }
        }
    }
    return $mods;
}

function getMinionMods() {
    global $oset;
    global $plugins;
    $modReturn = [];
    $modFile = __DIR__ . '/minion_options.json';
    $mods = parse_file($modFile)['minion_modules'];
    foreach ($plugins as $pluginName => $pluginConf) {
        if (isset($pluginConf['minion_modules'])) {
            $pmods = $pluginConf['minion_modules'];
            foreach ($pmods as $pmod) {
                $pmod['plugin'] = $pluginName;
                array_push($mods, $pmod);
                //logError([$pluginName, $pmod['label']], 'farts');
            }
        }
    }
    foreach ($mods as $mod) {
        if (isset($mod['plugin'])) {
            $modPath = $oset['file_root'] . '/plugins/' . $mod['plugin'] . $mod['path'];
        } else {
            $modPath = $oset['file_root'] . '/plugins/salt/' . $mod['path'];
        }
        if (file_exists($modPath . '/access.json')) {
            $mod['access'] = parse_file($modPath . '/access.json');
            array_push($modReturn, $mod);
        } else {
            $mod['access'] = [
                'methods' => [
                    'GET' => 'user:user',
                    'POST' => 'admin:user',
                    'DELETE' => 'admin:user',
                    'PATCH' => 'admin:user',
                    'OPTIONS' => 'user:user'
                ],
                'html_meta' => [
                    'title' => $mod['label'],
                    'image' => $plugins[$mod['plugin']]['logo_image'],
                    'description' => $mod['label'],
                    'url' => '%APP_URL%/' . $mod['href']
                ],
                'page_title' => $mod['label'],
                'skip_template' => false
            ];
            array_push($modReturn, $mod);
        }
    }
    return $modReturn;
}

function getSaltKeys($tgt = null) {
    if ($tgt == null) {
        $call = [
            "client" => "wheel",
            "fun" => "key.list_all"
        ];
    } else {
        $call = [
            "client" => "wheel",
            "fun" => "key.print",
            "match" => $tgt
        ];
    }
    $res = json_decode(saltCall($call), true)['return'][0];
    return $res;
}

function getMinionFromCache($minion, $fallback = true) {
    $call = [
        "client" => "runner",
        "fun" => "cache.grains",
        "tgt" => $minion,
        "tgt_type" => "glob"
    ];
    $saltCall = saltCall($call);
    $data = json_decode($saltCall, true)['return'][0];
    if (isset($data[$minion])) {
        return $data[$minion];
    } elseif ($fallback === true) {
        $call = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'grains.items'
        ];
        $exec = saltCall($call);
        $data = json_decode($exec, true)['return'][0];
        if (isset($data['minion'])) {
            return $data[$minion];
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function listMinionsFromCache($fallback = true) {
    $call = [
        "client" => "runner",
        "fun" => "cache.grains",
        "tgt" => "*"
    ];
    $saltCall = saltCall($call);
    $data = json_decode($saltCall, true)['return'][0];
    uksort($data, 'strnatcasecmp');
    return $data;
}

function getSaltToken($user = null, $pass = null, $host = null, $port = null) {
    global $oset;
    if (!isset($oset['salt_ssl_verify'])) {
        $oset['salt_ssl_verify'] = true;
    }
    if ($oset['salt_ssl_verify'] === false) {
        $ssl_verify = false;
    } else {
        $ssl_verify = true;
    }
    if ($host == null or $port == null) {
        $host = $oset['salt_api_addr'];
        $port = $oset['salt_api_port'];
    }
    if ($user == null or $pass == null) {
        if (isset($_SESSION['userdata']['salt_user']) and isset($_SESSION['userdata']['salt_pass'])) {
            $user = $_SESSION['userdata']['salt_user'];
            $pass = $_SESSION['userdata']['salt_pass'];
        } else {
            $user = $oset['salt_api_user'];
            $pass = $oset['salt_api_pass'];
        }
    }
    $api = curl_init();
    curl_setopt_array($api, [
        CURLOPT_POST => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_URL => $host . ":" . $port . "/login",
        CURLOPT_SSL_VERIFYHOST => $ssl_verify,
        CURLOPT_SSL_VERIFYPEER => $ssl_verify,
        CURLOPT_HTTPHEADER => [
            "User-Agent: curl/7.35.0",
            "Accept: application/json",
            "Content-Type: application/x-www-form-urlencoded"
        ],
        CURLOPT_POSTFIELDS => "username={$user}&password={$pass}&eauth=pam"
    ]);
    $res = curl_exec($api);
    if (curl_error($api)) {
        $api_err = curl_error($api);
        curl_close($api);
        error_log($api_err);
        return [
            "result" => false,
            "error" => $api_err
        ];
    }
    curl_close($api);
    $res = json_decode($res, true)['return'][0];
    if (isset($res['token']) and !empty($res['token'])) {
        return [
            "result" => true,
            "token" => $res['token'],
            "auth" => $res
        ];
    } else {
        return [
            "result" => false,
            "error" => "no token found"
        ];
    }
}

function saltCall($call) {
    global $oset;
    session_write_close();
    if (!isset($oset['salt_ssl_verify'])) {
        $oset['salt_ssl_verify'] = true;
    }
    if ($oset['salt_ssl_verify'] === true) {
        $ssl_verify = true;
    } else {
        $ssl_verify = false;
    }
    $host = $oset['salt_api_addr'];
    $port = $oset['salt_api_port'];
    $now = time();
    if (isset($_SESSION['salt_token']) && isset($_SESSION['salt_token_expire']) && ($_SESSION['salt_token_expire'] - $now) > 0) {
        // logError('user ' . $_SESSION['id'] . ' salt token has ' . ($_SESSION['salt_token_expire'] - $now) . ' remaining');
        $token = $_SESSION['salt_token'];
    } else {
        
        logError('refreshing salt token for user ' . $_SESSION['id'], 'SALT_API_AUTH');
        // logError([$_SESSION['salt_token_expire'], $now]);
        
        $tok = getSaltToken();
        if ($tok['result'] === false) {
            logError($tok, 'SALT_API_AUTH');
            return false;
        }
        $token = $tok['token'];
        $_SESSION['salt_token'] = $token;
        $_SESSION['salt_token_expire'] = $tok['auth']['expire'];
    }
    $postdata = json_encode($call);
    $api = curl_init();
    $api_headers = [
        "X-Auth-Token: " . $token,
        "Content-Type: application/json",
        "Accept: application/json",
        "User-Agent: curl/7.35.0"
    ];
    $api_opts = [
        CURLOPT_POST => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_SSL_VERIFYHOST => $ssl_verify,
        CURLOPT_SSL_VERIFYPEER => $ssl_verify,
        CURLOPT_URL => $host . ":" . $port,
        CURLOPT_POSTFIELDS => $postdata,
        CURLOPT_HTTPHEADER => $api_headers
    ];
    curl_setopt_array($api, $api_opts);
    $res = curl_exec($api);
    curl_close($api);
    return $res;
}