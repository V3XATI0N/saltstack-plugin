<?php
$grains = getMinionFromCache($minion);
if ($grains['kernel'] != "Windows" and empty($api_path[5])) { apiDie('specify user.', 400); }
$user = $api_path[5];
switch ($grains['kernel']) {
    case "Windows":
        //apiDie('not yet', 501);
        $call = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'task.list_tasks'
        ];
        break;
    default:
        $call = [
            'client' => 'local',
            'tgt' => $minion,
            'fun' => 'cron.list_tab',
            'kwarg' => [
                'user' => $user
            ]
        ];
}
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
if (isset($data[$minion])) {
    apiDie($data[$minion], 200);
} else {
    apiDie('not found', 404);
}