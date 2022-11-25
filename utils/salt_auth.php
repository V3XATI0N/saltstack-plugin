<?php

$coreUsers = getUsersAndGroups();

$tryToken = getSaltToken($user, $pass);
if ($tryToken['result'] === false) {
    return ['success' => false];
}

$userIdHash = md5($user);
$userFile = $oset['file_root'] . '/data/plugin_users.json';
if (file_exists($userFile)) {
    $userList = parse_file($userFile);
    foreach ($userList as $login => $profile) {
        if ($login == $userIdHash) {
            $profileData = $profile;
            $profileData['id'] = $userIdHash;
        }
    }
}

$profileData = $tryToken['auth'];
foreach ($tryToken['auth']['perms'] as $pi) {
    if (is_array($pi) and isset($pi['__console__'])) {
        $cperms = $pi['__console__'];
        $profileData['group'] = $cperms['group'];
        $profileData['groups'] = [$cperms['group']];
        $profileData['rank'] = $cperms['user_rank'];
        $userGroupId = $cperms['group'];
        //$gr = getGroupAccessLevel($cperms['group']);
    }
}

$profileData['id'] = $userIdHash;
$profileData['perms'] = $cperms;
if (!empty($profileData['rank'])) {
    $session_rank = $profileData['rank'];
} else {
    $session_rank = "user";
}

$ret_result = [
    "success" => true,
    "user_data" => $profileData,
    "session_data" => [
        "fullname" => $user,
        "salt_user" => $user,
        "salt_pass" => $pass,
        "id" => $userIdHash,
        "rank" => $session_rank,
        "group" => $userGroupId
    ],
    "user_groups" => $profileData['groups']
];
// logError($ret_result, 'SALT API USER LOGIN');
return $ret_result;