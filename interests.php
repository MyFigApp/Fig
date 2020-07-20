<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/google_client.php');

if (isset($_GET['categories'])) {
	$result = recalculateInterests($_GET['categories']);

	header('Content-Type: application/json');
	echo(json_encode($result));
	exit;
}

function recalculateInterests($categories = array()) {
	global $categories_table, $events_table, $gss, $spreadsheet_id;

	$result = array(
		'success' => false,
		'info' => ''
	);
	$options = array('valueRenderOption' => 'UNFORMATTED_VALUE');
	$interests_score = array();
	$range = $categories_table.'!A2:B';
	$category_rows = $gss->spreadsheets_values->get($spreadsheet_id, $range, $options);

	$range = $events_table.'!A2:G';
	$event_rows = $gss->spreadsheets_values->get($spreadsheet_id, $range, $options);

	foreach ($category_rows['values'] as $category_row) {
		$category_name = trim(strtolower($category_row[1]));
		$category_selected = 0;
		$category_score = 0;
		$category_rate = 1;
		$category_events_count = array();

		if (in_array($category_name, $categories)) {
			$category_selected = 1;
		}

		foreach ($event_rows['values'] as $event_row) {
			$event_category = trim(strtolower($event_row[2]));
			$event_status = trim(strtolower($event_row[3]));

			if ($event_category == $category_name) {
				switch ($event_status) {
					case 'scheduled':
						$category_score += 1;
						break;
					case 'starred':
						$category_score += 0.5;
						break;
				}
			}

			if (isset($category_events_count[$category_name])) {
				$category_events_count[$category_name]++;
			} else {
				$category_events_count[$category_name] = 0;
			}
		}

		if ($category_events_count[$category_name] > 0) {
			$category_rate = 2;
		}

		array_push($interests_score, array(($category_score + $category_selected) / $category_rate));
	}

	$body = new Google_Service_Sheets_ValueRange([
		'values' => $interests_score
	]);
	$range = $categories_table.'!A2:A';
	$options = array('valueInputOption' => 'RAW');
	$results = $gss->spreadsheets_values->update($spreadsheet_id, $range, $body, $options);

	$result['success'] = true;
	$result['info'] = $results->getUpdatedCells();

	return $result;
}

?>