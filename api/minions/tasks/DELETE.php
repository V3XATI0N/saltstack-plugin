<?php

$kernel = $api_data['kernel'];
$user = $api_data['user'];
$id = $api_data['ident'];
$cmd = $api_data['cmd'];
$group = $api_data['group'];

switch ($kernel) {
    case "Windows":
        apiDie('oops', 501);
        break;
    case "Linux":
    default:
        switch ($api_data['group']) {
            case "env":
                $call =[
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.rm_env',
                    'kwarg' => [
                        'user' => $api_data['user'],
                        'name' => $id
                    ]
                ];
                break;
            case "special":
                $call = [
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.rm_special',
                    'kwarg' => [
                        'user' => $user,
                        'identifier' => $id,
                        'cmd' => $cmd
                    ]
                ];
                break;
            case "crons":
            default:
                $call = [
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.rm_job',
                    'kwarg' => [
                        'user' => $user,
                        'identifier' => $id,
                        'cmd' => $cmd
                    ]
                ];
        }
        $data = json_decode( saltCall( $call ), true)['return'][0];
        apiDie($data, 200);
}