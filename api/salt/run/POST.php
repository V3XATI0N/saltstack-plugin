<?php

if (($api_data['client'] != "runner" and $api_data['client'] != "wheel" and empty($api_data['tgt'])) or empty($api_data['fun'])) { apiDie('insufficient instructions', 400); }
$fun = $api_data['fun'];
$cli = $api_data['client'];
if (isset($api_data['tgt'])) {
    $tgt = $api_data['tgt'];
}

switch ($cli) {
    case "wheel":
        $call = $api_data;
        break;
    default:
        if (is_array($tgt)) {
            $tgt_array = $tgt;
            $tgt = implode(",", $tgt);
            $tgt_type = "list";
        } elseif (preg_match('/^C@.*$/', $tgt)) {
            $tgt_array = null;
            $tgt_type = "compound";
        } else {
            $tgt_array = [$tgt];
            $tgt_type = "glob";
        }
        
        if (isset($api_data['tgt_type'])) {
            $tgt_type = $api_data['tgt_type'];
        }
        
        if (!empty($api_data['client'])) {
            $client = $api_data['client'];
        } else {
            $client = "local";
        }
        
        if (isset($api_data['salt_call'])) {
            $call = $api_data['salt_call'];
        } else {
            $call = [
                "client" => $client,
                "tgt" => $tgt,
                "tgt_type" => $tgt_type,
                "fun" => $fun
            ];
            if (isset($api_data['kwarg'])) {
                $call['kwarg'] = $api_data['kwarg'];
            }
        }
}

$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];
apiDie($data, 200);
