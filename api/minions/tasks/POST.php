<?php

switch ($api_data['kernel']) {
    case "Windows":
        apiDie('sorry, no can do buckaroo', 501);
        break;
    case "Linux":
    default:
        if ($api_data['group'] != "env") {
            $identifier = generateRandomString(16);
            $api_data['task']['identifier'] = $identifier;
        }
        switch ($api_data['group']) {
            case "env":
                $call = [
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.set_env',
                    'kwarg' => $api_data['task']
                ];
                break;
            case "special":
                $call = [
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.set_special',
                    'kwarg' => $api_data['task']
                ];
                break;
            case "crons":
            default:
                $call = [
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.set_job',
                    'kwarg' => $api_data['task']
                ];
        }
}

$data = json_decode( saltCall( $call ), true )['return'][0];
apiDie($data, 201);
