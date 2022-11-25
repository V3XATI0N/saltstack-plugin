<?php

if (empty($api_path[4])) { apiDie('give me a key dang it', 400); }

$call = [
    "client" => "wheel",
    "fun" => "key.delete",
    "match" => $api_path[4]
];
$exec = saltCall($call);
$data = json_decode($exec, true);

apiDie($data, 200);