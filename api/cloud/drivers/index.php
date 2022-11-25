<?php

if (file_exists(__DIR__ . '/' . $api_method . '.php')) {
    include(__DIR__ . '/' . $api_method . '.php');
} else {
    apiDie('so sad', 405);
}