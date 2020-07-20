<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

require_once($_SERVER['DOCUMENT_ROOT'].'/libs/google-api-php-client/vendor/autoload.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/libs/smarty/Smarty.class.php');

$smarty = new Smarty();
$smarty->template_dir = $_SERVER['DOCUMENT_ROOT'].'/tmpl/';
$smarty->compile_dir = $_SERVER['DOCUMENT_ROOT'].'/tmpl/compiled/';

$redirect_uri = 'http://'.$_SERVER['HTTP_HOST'];
$google_client = new Google_Client();
$google_client->setClientId('404463758628-0nk8e4l8fsq0rgkfs4e9v4hv7v7ems4q.apps.googleusercontent.com');
$google_client->setClientSecret('PiSSQqdE0XPUkEybFDz-oNv_');
$google_client->setRedirectUri($redirect_uri);
$google_client->addScope(Google_Service_Sheets::SPREADSHEETS);
$google_client->addScope('https://www.googleapis.com/auth/userinfo.profile');
$google_client->addScope('https://www.googleapis.com/auth/userinfo.email');

if (isset($_GET['logout'])) {
	unset($_SESSION['token']);

	$google_client->revokeToken();
}

if (isset($_GET['code'])) {
	$token = $google_client->authenticate($_GET['code']);
	$_SESSION['token'] = $token;
	header('Location: '.filter_var($redirect_uri, FILTER_SANITIZE_URL));
}

$expired = new DateTime();
$c_time = new DateTime();
$g_time = new DateTime('1899-12-30 00:00:00+00:00');
$u_time = new DateTime('1970-01-01 00:00:00+00:00');
$time_diff = $u_time->diff($g_time);
$g_time_diff = $time_diff->days*60*60*24;

if (isset($_SESSION['token'])) {
	$expired->setTimestamp($_SESSION['token']['created'] + $_SESSION['token']['expires_in']);
}

if ($c_time < $expired) {
	$google_client->setAccessToken($_SESSION['token']);
} else {
	$authUrl = $google_client->createAuthUrl();

	$smarty->assign('logout', isset($_GET['logout']));
	$smarty->assign('url', $authUrl);
	$smarty->display('auth.tmpl');

	exit;
}

$oauth = new Google_Service_Oauth2($google_client);
$user = $oauth->userinfo->get();

$gss = new Google_Service_Sheets($google_client);
$spreadsheet_id = '1FEjVqDZwES6G10GnmuhWntNF7Y45jqVZMHuthf4n36U';
$events_table = 'Web App Content';
$categories_table = 'User Interests';
$users_table = 'Users';

?>