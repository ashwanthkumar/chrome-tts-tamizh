<?php
require_once("functions.php");

define("TTS_URL", "http://speech.ssn.edu.in/synthesise.php");
define("DOWNLOAD_URL", "http://speech.ssn.edu.in/wav/");
define("MP3_CONVERTOR", "http://labs.ashwanthkumar.in/ffmpeg/");

$gender = $_POST['gender'];
$text = $_POST['text'];

$fields = array(
  'options' => urlencode($gender),
  'word' => urlencode($text)
);

$fields_string = "";
foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
rtrim($fields_string, '&');

// POST TO TTS Server
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, TTS_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_POST, count($fields));
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
$response = curl_exec($ch);
curl_close($ch);

$headers = get_headers_from_curl_response($response);

$contentLength = $headers["Content-Length"];
parse_str(parse_url($headers["Location"], PHP_URL_QUERY));
$audioLink = MP3_CONVERTOR . "?stream=true&url=" . urlencode(DOWNLOAD_URL . $name);
$result = array("url" => $audioLink, "debug" => array(
                "response" => $response,
                "gender" => $gender,
                "text" => $text,
                "headers" => $headers
                ));

// Returns the urls to download the voices in a JSON
header('Content-Type: application/json');
echo json_encode($result);
