<?php

$saltClient = new SaltClient();
$minions = $saltClient->get_minions('*');
$returnData = [];
foreach ($minions as $minion => $grains) {
    if ((!empty($url_query['details']) and $url_query['details'] == "true") or !empty($api_path[3])) {
        $minionItem = [
            'id' => $minion,
            'grains' => $grains
        ];
        if ($minion == $api_path[3]) {
            if (!empty($api_path[4])) {
                if (!empty($grains[$api_path[4]])) {
                    apiDie([
                        'id' => $minion,
                        $api_path[4] => $grains[$api_path[4]]
                    ]);
                }
            }
            apiDie($minionItem, 200);
        }
        array_push($returnData, $minionItem);
    } else {
        array_push($returnData, $minion);
    }
}
if (!empty($api_path[3])) {
    apiDie('none', 404);
}
apiDie($returnData, 200);