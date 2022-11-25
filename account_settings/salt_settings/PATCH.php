<?php
$data = $_SESSION['userdata'];
$prof = getUserProfile($_SESSION['id']);

foreach($api_data as $dk => $dv) {
    $prof[$dk] = $dv;
}

if (isset($prof['auth_source'])) {
    $uList = parse_file($oset['file_root'] . '/data/plugin_users.json');
    $uSave = [];
    foreach ($uList as $login => $conf) {
        // logError([$login, $conf['id']]);
        if ($conf['id'] == $_SESSION['id']) {
            $uSave[$login] = $prof;
        } else {
            $uSave[$login] = $conf;
        }
    }
    emit_file($oset['file_root'] . '/data/plugin_users.json', $uSave);
} else {
    $uSave = [];
    $uList = getUsersAndGroups();
    foreach ($uList['users'] as $login => $conf) {
        if ($conf['id'] == $_SESSION['id']) {
            $uSave[$login] = $prof;
        } else {
            $uSave[$login] = $conf;
        }
    }
    $uList['users'] = $uSave;
    saveUsersAndGroups($uList);
}

if (!empty($api_data['salt_user']) and !empty($api_data['salt_pass'])) {
    $_SESSION['userdata']['salt_user'] = $api_data['salt_user'];
    $_SESSION['userdata']['salt_pass'] = $api_data['salt_pass'];
}

apiDie([$prof], 200);