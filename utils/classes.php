<?php

class SaltClient {
    public $ssl_verify;
    function __construct() {
        global $oset;
        if (!isset($oset['salt_ssl_verify'])) {
            $oset['salt_ssl_verify'] = true;
        }
        if ($oset['salt_ssl_verify'] === false) {
            $this->ssl_verify = false;
        } else {
            $this->ssl_verify = true;
        }
    }
    # AUTH TOKEN
    public function get_token($host = null, $port = null, $user = null, $pass = null) {
        global $oset;
        if ($host === null or $port === null) {
            $host = $oset['salt_api_addr'];
            $port = $oset['salt_api_port'];
        }
        if ($user === null or $pass === null) {
            if (isset($_SESSION['userdata']['salt_user']) and isset($_SESSION['userdata']['salt_pass'])) {
                $user = $_SESSION['userdata']['salt_user'];
                $pass = $_SESSION['userdata']['salt_pass'];
            } else {
                $user = $oset['salt_api_user'];
                $pass = $oset['salt_api_pass'];
            }
        }
        $api = curl_init();
        curl_setopt_array($api, [
            CURLOPT_POST => 1,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_URL => $host . ":" . $port . "/login",
            CURLOPT_SSL_VERIFYHOST => $this->ssl_verify,
            CURLOPT_SSL_VERIFYPEER => $this->ssl_verify,
            CURLOPT_HTTPHEADER => [
                "User-Agent: curl/7.35.0",
                "Accept: application/json",
                "Content-Type: application/x-www-form-urlencoded"
            ],
            CURLOPT_POSTFIELDS => "username={$user}&password={$pass}&eauth=pam"
        ]);
        $res = curl_exec($api);
        if (curl_error($api)) {
            $api_err = curl_error($api);
            curl_close($api);
            logError($api_err, 'SALTCLIENT ERROR in get_token: CURL FAILURE');
            return false;
        }
        curl_close($api);
        $res = json_decode($res, true)['return'][0];
        if (!empty($res['token'])) {
            return [
                "token" => $res['token'],
                "expire" => $res['expire']
            ];
        } else {
            logError($res, 'SALTCLIENT ERROR in get_token: MISSING TOKEN');
            return false;
        }
    }
    # GENERIC SALT CALL
    public function call($call) {
        global $oset;
        session_write_close();
        $host = $oset['salt_api_addr'];
        $port = $oset['salt_api_port'];
        if (isset($_SESSION['userdata']['salt_user']) and isset($_SESSION['userdata']['salt_pass'])) {
            $user = $_SESSION['userdata']['salt_user'];
            $pass = $_SESSION['userdata']['salt_pass'];
        } else {
            $user = $oset['salt_api_user'];
            $pass = $oset['salt_api_pass'];
        }
        $now = time();
        if (isset($_SESSION['salt_token']) && isset($_SESSION['salt_token_expire']) && ($_SESSION['salt_token_expire'] - $now) > 0) {
            //logError('user ' . $_SESSION['id'] . ' salt token has ' . ($_SESSION['salt_token_expire'] - $now) . ' remaining');
            $token = $_SESSION['salt_token'];
        } else {
            $getToken = $this->get_token();
            if ($getToken === false) {
                //logError($getToken, 'problem lol');
                return false;
            }
            $token = $getToken['token'];
            $expire = $getToken['expire'];
            $_SESSION['salt_token'] = $token;
            $_SESSION['salt_token_expire'] = $expire;
        }
        $call = json_encode($call);
        $api = curl_init();
        curl_setopt_array($api, [
            CURLOPT_POST => 1,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_URL => $host . ":" . $port,
            CURLOPT_SSL_VERIFYHOST => $this->ssl_verify,
            CURLOPT_SSL_VERIFYPEER => $this->ssl_verify,
            CURLOPT_POSTFIELDS => $call,
            CURLOPT_HTTPHEADER => [
                "User-Agent: curl/7.35.0",
                "Accept: application/json",
                "Content-Type: application/json",
                "X-Auth-Token: " . $token
            ],
        ]);
        $res = curl_exec($api);
        if (curl_error($api)) {
            $api_err = curl_error($api);
            curl_close($api);
            logError($api_err, 'SALTCLIENT ERROR in get_token: CURL FAILURE');
            return false;
        }
        curl_close($api);
        $res = json_decode($res, true);
        return $res;
    }
    # PKI KEYS
    public function get_keys($minion = null) {
        if ($minion === null) {
            $call = [
                'client' => 'wheel',
                'fun' => 'key.list_all'
            ];
        } else {
            $call = [
                'client' => 'wheel',
                'fun' => 'key.print',
                'match' => $minion
            ];
        }
        $res = $this->call($call);
        return $res;
    }
    public function delete_key($minion) {
        if ($minion === null) {
            return false;
        } else {
            $call = [
                'client' => 'wheel',
                'fun' => 'key.delete',
                'match' => $minion
            ];
        }
        $res = $this->call($call);
        return $res;
    }
    public function accept_key($minion) {
        $call = [
            'client' => 'wheel',
            'fun' => 'key.accept',
            'match' => $minion
        ];
        $res = $this->call($call);
        return $res;
    }
    public function reject_key($minion) {
        $call = [
            'client' => 'wheel',
            'fun' => 'key.reject',
            'match' => $minion
        ];
        $res = $this->call($call);
        return $res;
    }
    # MINIONS
    public function get_minions($tgt) {
        $call = [
            'client' => 'runner',
            'fun' => 'cache.grains',
            'tgt' => $tgt,
            'tgt_type' => 'compound'
        ];
        $res = $this->call($call)['return'][0];
        return $res;
    }
    # PILLAR DATA
    public function get_pillar($minion) {
        $call = [
            'client' => 'runner',
            'fun' => 'cache.pillar',
            'tgt' => $minion
        ];
        $res = $this->call($call)['return'][0];
        return $res;
    }
    # GRAIN DATA
    public function set_minion_grains($minion, $grainData) {
        return false;
    }
}