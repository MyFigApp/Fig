<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/google_client.php');
/*
require_once($_SERVER['DOCUMENT_ROOT'].'/libs/smarty/Smarty.class.php');

$smarty = new Smarty();
$smarty->template_dir = $_SERVER['DOCUMENT_ROOT'].'/tmpl/';
$smarty->compile_dir = $_SERVER['DOCUMENT_ROOT'].'/tmpl/compiled/';
*/
$events = array(
	'upcoming' => array(
		'events' => array(),
		'count' => 0
	),
	'scheduled' => array(
		'events' => array(),
		'count' => 0
	),
	'starred' => array(
		'events' => array(),
		'count' => 0
	),
	'past' => array(
		'events' => array(),
		'count' => 0
	)
);
$categories = array();
$interests = array();
$username = '';

$range = $users_table.'!A2:A';
$options = array('valueRenderOption' => 'UNFORMATTED_VALUE');
$rows = $gss->spreadsheets_values->get($spreadsheet_id, $range, $options);
$username = $rows[count($rows) - 1][0];

$row_id = 2;
$range = $events_table.'!A2:G';
$options = array('valueRenderOption' => 'UNFORMATTED_VALUE');
$rows = $gss->spreadsheets_values->get($spreadsheet_id, $range, $options);

foreach ($rows['values'] as $row) {
	$category = trim(strtolower($row[2]));
	$event_follows = empty($row[4]) ? 0 : intval($row[4]);
	$status = trim(strtolower($row[3]));
	$e_time = new DateTime();
	$e_time->setTimestamp(intval($row[5]*60*60*24) - $g_time_diff);

	$event = array(
		'id' => $row[0],
		'title' => $row[1],
		'category' => $category,
		'status' => $status,
		'follows' => $event_follows,
		'fulldate' => $e_time,
		'date' => $e_time->format('l, F j'),
		'time' => $e_time->format('h:i A'),
		'address' => $row[6]
	);

	if ($c_time >= $e_time) {
		$range = $events_table.'!D'.$row_id.':D'.$row_id;
		$body = new Google_Service_Sheets_ValueRange([
			'values' => array(['Past'])
		]);
		$options = array('valueInputOption' => 'RAW');
		$results = $gss->spreadsheets_values->update($spreadsheet_id, $range, $body, $options);

		array_push($events['past']['events'], $event);
		$events['past']['count']++;
	} else {
		if (!empty($category)) {
			if (isset($categories[$category])) {
				$categories[$category]['follows'] += $event_follows;
				$categories[$category]['count']++;
			} else {
				$categories = array_merge($categories, array($category => array(
					'follows' => $event_follows,
					'count' => 1
				)));
			}
		}

		array_push($events['upcoming']['events'], $event);
		$events['upcoming']['count']++;

		switch ($status) {
			case 'scheduled':
				array_push($events['scheduled']['events'], $event);
				$events['scheduled']['count']++;
				break;
			case 'starred':
				array_push($events['starred']['events'], $event);
				$events['starred']['count']++;
				break;
		}
	}

	$row_id++;
}

$range = $categories_table.'!A2:B';
$options = array('valueRenderOption' => 'UNFORMATTED_VALUE');
$rows = $gss->spreadsheets_values->get($spreadsheet_id, $range, $options);
$interests_score = array();

foreach ($rows['values'] as $row) {
	$rate = 1;
	$selected = 0;
	$score = 0;
	$name = trim(strtolower($row[1]));

	foreach ($events['scheduled']['events'] as $event) {
		if ($event['category'] == $name) {
			$score += 1;
		}
	}

	foreach ($events['starred']['events'] as $event) {
		if ($event['category'] == $name) {
			$score += 0.5;
		}
	}

	if (isset($categories[$name])) {
		if ($categories[$name]['count'] > 0) {
			$rate = 2;
		}
	}

	array_push($interests_score, array(($score + $selected) / $rate));
	array_push($interests, $name);
}

$body = new Google_Service_Sheets_ValueRange([
	'values' => $interests_score
]);
$range = $categories_table.'!A2:A';
$options = array('valueInputOption' => 'RAW');
$gss->spreadsheets_values->update($spreadsheet_id, $range, $body, $options);

/*foreach ($events as &$info) {
	uasort($info['events'], function($a, $b) {
		return ($a['fulldate'] > $b['fulldate']);
	});
}*/

/*uasort($categories, function($a, $b) {
	return ($a['follows'] < $b['follows']);
});*/

ksort($categories);
array_splice($categories, 9);

$smarty->assign('username', $username);
$smarty->assign('categories', $categories);
$smarty->assign('events', $events);
$smarty->assign('interests', $interests);

$smarty->assign('user', $user);

$smarty->display('index_old.tmpl');

?>