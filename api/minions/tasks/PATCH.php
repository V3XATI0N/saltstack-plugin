<?php

switch ($api_data['kernel']) {
    case "Windows":
        apiDie('sorry, no can do buckaroo', 501);
        break;
    case "Linux":
    default:
        if (empty($api_data['task']['identifier'])) { apiDie('specify identifier.', 400); }
        switch ($api_data['group']) {
            case "env":
                $call = [
                    'client' => 'local',
                    'tgt' => $minion,
                    'fun' => 'cron.set_env',
                    'kwarg' => [
                        'user' => $api_data['task']['user'],
                        'name' => $api_data['task']['name'],
                        'value' => $api_data['task']['value']
                    ]
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
// logError($data);
apiDie($data, 200);
