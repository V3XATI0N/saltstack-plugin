<?php
$grains = getMinionFromCache($minion);
$kernel = $grains['kernel'];
if (empty($api_path[5])) {
    switch ($kernel) {
        case "Windows":
            $call = [
                'client' => 'local',
                'tgt' => $minion,
                'fun' => 'group.getent'
            ];
            $data = json_decode(saltCall($call), true)['return'][0];
            $list = [];
            foreach ($data as $minion_name => $groups) {
                if ($minion_name == $minion) {
                    foreach ($groups as $group) {
                        array_push($list, $group['gid'] . ':' . $group['name']);
                    }
                }
            }
            apiDie($list, 200);
            break;
            case "Darwin":
        case "Linux":
        case "SunOS":
        default:
            $call = [
                'client' => 'local',
                'tgt' => $minion,
                'fun' => 'cmd.run',
                'kwarg' => [
                    'shell' => '/bin/bash',
                    'cmd' => 'getent group | cut -d: -f1 | sort'
                ]
            ];
            $data = json_decode(saltCall($call), true)['return'][0];
            $list = [];
            foreach ($data as $minion_name => $minion_groups) {
                if ($minion_name == $minion) {
                    $groups = preg_split("/\r\n|\n|\r/", $minion_groups);
                    sort($groups);
                    foreach ($groups as $gn) {
                        if (!in_array($gn, $list)) {
                            array_push($list, $gn);
                        }
                    }
                }
            }
            apiDie($list, 200);
            break;
    }
} else {
    switch ($kernel) {
        case "Linux":
            $call = [
                'client' => 'local',
                'tgt' => $minion,
                'fun' => 'cmd.run',
                'kwarg' => [
                    'cmd' => 'getent group',
                    'shell' => '/bin/bash'
                ]
            ];
            $data = explode("\n", json_decode(saltCall($call), true)['return'][0][$minion]);
            foreach ($data as $grpLine) {
                $grpData = explode(':', $grpLine);
                $groupName = $grpData[0];
                if ($groupName == $api_path[5]) {
                    $groupPasswd = $grpData[1];
                    $groupId = $grpData[2];
                    $groupMembers = explode(',', $grpData[3]);
                    $gm = [];
                    foreach ($groupMembers as $m) {
                        if ($m != "") { array_push($gm, $m); }
                    }
                    $returnData = [
                        "name" => $groupName,
                        "gid" => $groupId,
                        "passwd" => $groupPasswd,
                        "members" => $gm
                    ];
                    apiDie($returnData, 200);
                }
            }
            apiDie('no such group ' . $api_path[5], 404);
            break;
        default:
            $call = [
                'client' => 'local',
                'tgt' => $minion,
                'fun' => 'group.info',
                'arg' => urldecode($api_path[5])
            ];
            $exec = saltCall($call);
            $data = json_decode($exec, true)['return'][0][$minion];
    }
}
if (isset($api_path[6])) {
    if (isset($data[$api_path[6]])) {
        apiDie($data[$api_path[6]], 200);
    } else {
        apiDie('no thing', 404);
    }
} else {
    apiDie($data, 200);
}