<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/google_client.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/interests.php');

if (isset($_GET['action'])) {
	$range = $events_table.'!A2:J';
	$options = array('valueRenderOption' => 'UNFORMATTED_VALUE');
	$rows = $gss->spreadsheets_values->get($spreadsheet_id, $range, $options);
	$result = array(
		'success' => false,
		'data' => ''
	);

	switch ($_GET['action']) {
		case 'get':
			$event = array();

			foreach ($rows['values'] as $row) {
				if ($row[0] == $_GET['id']) {
					$e_time = new DateTime();
					$e_time->setTimestamp(intval($row[5]*60*60*24) - $g_time_diff);

					$status = trim(strtolower($row[3]));
					$is_past = ($c_time >= $e_time);
					$category = trim(strtolower($row[2]));
					$event_follows = empty($row[4]) ? 0 : intval($row[4]);

					$c_time->setTime(0, 0, 0);
					$date_diff = $c_time->diff($e_time);
					$date_name = '';

					if ($date_diff->invert == 0) {
						switch ($date_diff->days) {
							case 0:
								$date_name = 'Today at';
								break;
							case 1:
								$date_name = 'Tomorrow at';
								break;
						}
					}

					$event = array(
						'id' => $row[0],
						'title' => $row[1],
						'category' => $category,
						'status' => $status,
						'is_past' => $is_past,
						'follows' => $event_follows,
						'fulldate' => $e_time,
						'date' => ($date_name != '') ? $date_name : $e_time->format('l, F j'),
						'time' => (intval($e_time->format('i')) > 0) ? $e_time->format('g:ia') : $e_time->format('ga'),
						'address' => $row[6]
					);

					$result['success'] = true;
					$result['data'] = $event;

					header('Content-Type: application/json');
					echo(json_encode($result));
					exit;
				}
			}
			break;
		case 'set':
			if (isset($_GET['fields'])) {
				$fields = array(
					'name' => 'H',
					'status' => 'D',
					'title' => 'B',
					'count' => 'E',
					'time' => 'F',
					'address' => 'G',
					'category' => 'C'
				);
				$row_id = 2;
				$range = $events_table.'!';

				foreach ($rows['values'] as $row) {
					if ($row[0] == $_GET['id']) {
						$field_id = 1;
						$event_values = array();

						foreach ($_GET['fields'] as $name => $value) {
							$col_id = $fields[$name];
							$cell_name = $col_id.$row_id;

							if ($field_id == 1) {
								$range .= $cell_name;
							}

							array_push($event_values, ucfirst($value));

							$field_id++;
						}

						$range .= ':'.$cell_name;

						recalculateInterests();

						$body = new Google_Service_Sheets_ValueRange([
							'values' => array($event_values)
						]);
						$options = array('valueInputOption' => 'RAW');
						$results = $gss->spreadsheets_values->update($spreadsheet_id, $range, $body, $options);
						$result['success'] = true;
						$result['data'] += $results->getUpdatedCells();

						header('Content-Type: application/json');
						echo(json_encode($result));
						exit;
					}

					$row_id++;
				}
			}
			break;
		case 'list':
			$events = array();

			foreach ($rows['values'] as $row) {
				$status = trim(strtolower($row[3]));
				$category = trim(strtolower($row[2]));
				$event_follows = empty($row[4]) ? 0 : intval($row[4]);
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

				if (isset($_GET['status'])) {
					switch ($_GET['status']) {
						case 'upcoming':
							if ($c_time < $e_time) {
								$event['status'] = 'upcoming';
								array_push($events, $event);
							}
							break;
						case 'past':
							if ($c_time >= $e_time) {
								$event['status'] = 'past';
								array_push($events, $event);
							}
							break;
						
						default:
							if (($status == $_GET['status']) && ($c_time < $e_time)) {
								array_push($events, $event);
							}
							break;
					}
				} elseif (isset($_GET['category']) && ($category == $_GET['category'])) {
					if ($c_time < $e_time) {
						array_push($events, $event);
					}
				}
			}

			/*uasort($events, function($a, $b) {
				return ($a['fulldate'] > $b['fulldate']);
			});*/

			$result['success'] = true;
			$result['data'] = $events;

			header('Content-Type: application/json');
			echo(json_encode($result));
			exit;

			break;
	}
}

?>