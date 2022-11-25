<?php

$test = getSaltToken();

if ($test['result'] === false) {
    apiDie("authentication failed :(", 406);
} else {
    apiDie($test, 200);
}