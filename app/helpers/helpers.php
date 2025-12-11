<?php
function hash_password($pass){
    return password_hash($pass, PASSWORD_DEFAULT);
}
function verify_password($pass, $hash){
    return password_verify($pass, $hash);
}
function generate_token(){
    return bin2hex(random_bytes(32));
}
