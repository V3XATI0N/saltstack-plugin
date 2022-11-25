<?php
session_write_close();
if (empty($api_path[4])) {
    $call = [
        'client' => 'runner',
        'fun' => 'jobs.list_jobs'
    ];
    $data = json_decode( saltCall( $call ), true )['return'][0];
    $ret = [];
    foreach ($data as $jidName => $jidConf) {
        $ret[$jidConf['Function'] . ' :: ' . $jidConf['Target']] = $jidName;
    }
    apiDie($ret, 200);
}
$jid = $api_path[4];
$call = [
    'client' => 'runner',
    'fun' => 'jobs.list_job',
    'arg' => $jid
];
$exec = saltCall($call);
$data = json_decode($exec, true)['return'][0];

if (count($data['Result']) >= count($data['Minions'])) {
    $minionReturns = [];
    if (count($data['Result']) == 0) {
        if ($data['Error'] == "Cannot contact returner or no job with this jid") {
            apiDie('no such job found', 404);
        }
    }
    foreach ($data["Result"] as $min => $ret) {
        $minionReturns[$min] = [$ret["success"], $ret["return"]];
    }
    apiDie(["fun"=>$data['Function'], "result"=>$minionReturns, "fulldata"=>$data], 200);
} else {
    apiDie(['not ready', $data], 423);
}
