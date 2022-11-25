<?php

$saltClient = new SaltClient();
$keys = $saltClient->get_keys(null);

$keyData = $keys['return'][0]['data']['return'];
$keyReturn = [];

foreach ($keyData as $keyState => $keyList) {
    if ($keyState == 'local') { continue; }
    switch ($keyState) {
        case 'minions_rejected':
            $keyState = "rejected";
            break;
        case 'minions_denied':
            $keyState = "denied";
            break;
        case 'minions_pre':
            $keyState = "pending";
            break;
        case 'minions':
            $keyState = "accepted";
    }
    if (count($keyList) > 0) {
        foreach ($keyList as $keyItem) {
            if ((!empty($url_query['details']) and $url_query['details'] == "true") or !empty($api_path[3])) {
                $keyItemObj = [
                    'id' => $keyItem,
                    'state' => $keyState
                ];
                if (!empty($api_path[3]) and $keyItem == $api_path[3]) {
                    apiDie($keyItemObj, 200);
                }
                array_push($keyReturn, $keyItemObj);
            } else {
                array_push($keyReturn, $keyItem);
            }
        }
        if (!empty($api_path[3])) {
            apiDie('no such key', 404);
        }
    }
}

apiDie($keyReturn, 200);
