<?php

set_time_limit(0);

$post = '';
if (isset($GLOBALS['HTTP_RAW_POST_DATA'])) {
    $post = $GLOBALS['HTTP_RAW_POST_DATA'];
}
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://jabber.prostoy.ru:5281/http-bind");
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
curl_setopt($ch, CURLOPT_TIMEOUT, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$content = curl_exec($ch);
$result = curl_getinfo($ch);
curl_close($ch);

header("Status: {$result['http_code']}");
header("Content-Type: {$result['content_type']}");
echo $content;
?>