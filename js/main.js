$(document).ready(function() {
	window.onpopstate = function() {
		pageChange();
	};
	pageChange();

	$('#menu-btn').click(function(e) {
		e.preventDefault();

		toggleMenu();

		if (!$('#screens').hasClass('close')) {
			$('#screens .screen').hide();
			$('#screens .screen').each(function() {
				if ($(this).css('display') == 'none') {
					$('#main.screen').show();
				}
			});
		}
	});

	$('#filter-btn').click(function(e) {
		e.preventDefault();

		/**/
	});

	$('#star-btn').click(function(e) {
		e.preventDefault();

		var btnEl = $(this),
			id = $('#info.screen').data('eventId'),
			eventEl = $('#main.screen .events > li > a[data-event-id="'+id+'"]'),
			starredCountEl = $('#menu .list > li > a[data-status="starred"] .count'),
			upcomingCountEl = $('#menu .list > li > a[data-status="upcoming"] .count'),
			starredCount = parseInt(starredCountEl.html()),
			upcomingCount = parseInt(upcomingCountEl.html()),
			status = '';

		btnEl.toggleClass('active');

		if (btnEl.hasClass('active')) {
			status = 'starred';
			starredCountEl.html(starredCount + 1);
			upcomingCountEl.html(upcomingCount - 1);
		} else {
			status = 'upcoming';
			starredCountEl.html(starredCount - 1);
			upcomingCountEl.html(upcomingCount + 1);
		}

		eventEl.attr('class', status);

		$.ajax({
			dataType: 'json',
			url: '/event.php',
			data: {
				'action': 'set',
				'id': id,
				'fields': {
					'status': status
				}
			},
			success: function(results) {
				console.log(results);
			}
		});
	});

	$('#blind').click(function(e) {
		toggleMenu();
	});

	$('#menu .list .underconstruction').click(function(e) {
		e.preventDefault();

		toggleMenu();

		$('#screens .screen').hide();
		$('#underconstruction.screen').show();
	});

	$('#menu .list .categories a').click(function(e) {
		e.preventDefault();

		var btnEl = $(this),
			category = btnEl.data('category');

		$('#menu .list .categories a').removeClass('active');
		$('#menu .list > li > a').removeClass('active');
		btnEl.addClass('active');

		$('#main.screen .events > li > a.upcoming').each(function() {
			var btnEl = $(this);

			btnEl.parent('li').hide();

			if (btnEl.data('category') == category) {
				btnEl.parent('li').show();
			}
		});

		toggleMenu();

		$('#screens .screen').hide();
		$('#main.screen').show();
	});

	$('#menu .footer .user').click(function(e) {
		e.preventDefault();

		toggleMenu();

		$('#screens .screen').hide();
		$('#user.screen').show();
	});

	$('#menu .list > li > a').click(function(e) {
		e.preventDefault();

		var btnEl = $(this),
			status = btnEl.data('status');

		$('#menu .list .categories a').removeClass('active');
		$('#menu .list > li > a').removeClass('active');
		btnEl.addClass('active');

		$('#main.screen .events > li').hide();
		$('#main.screen .events > li > a').each(function() {
			var eventEl = $(this);

			if (eventEl.hasClass(status)) {
				eventEl.parent('li').show();
			}
		});

		toggleMenu();

		$('#screens .screen').hide();
		$('#main.screen').show();
	});

	$('#menu .footer .settings-btn').click(function(e) {
		e.preventDefault();

		toggleMenu();

		$('#screens .screen').hide();
		$('#underconstruction.screen').show();
	});

	$('#info.screen #follow').click(function(e) {
		e.preventDefault();

		var btnEl = $(this),
			id = $('#info.screen').data('eventId'),
			eventEl = $('#main.screen .events > li > a[data-event-id="'+id+'"]'),
			scheduledCountEl = $('#menu .list > li > a[data-status="scheduled"] .count'),
			upcomingCountEl = $('#menu .list > li > a[data-status="upcoming"] .count'),
			scheduledCount = parseInt(scheduledCountEl.html()),
			upcomingCount = parseInt(upcomingCountEl.html()),
			followsCountEl = $('#info.screen .follows .count'),
			followsCount = parseInt(followsCountEl.html()),
			status = '';

		btnEl.toggleClass('active');

		if (btnEl.hasClass('active')) {
			status = 'scheduled';
			followsCount++;
			scheduledCountEl.html(scheduledCount + 1);
			upcomingCountEl.html(upcomingCount - 1);
			btnEl.html(btnEl.data('active'));
		} else {
			status = 'upcoming'
			followsCount--;
			scheduledCountEl.html(scheduledCount - 1);
			upcomingCountEl.html(upcomingCount + 1);
			btnEl.html(btnEl.data('inactive'));
		}

		eventEl.attr('class', status);

		$.ajax({
			dataType: 'json',
			url: '/event.php',
			data: {
				'action': 'set',
				'id': $('#info.screen').data('eventId'),
				'fields': {
					'status': status,
					'count': followsCount
				}
			},
			success: function(results) {
				console.log(results);
			}
		});

		followsCountEl.html(followsCount);
	});

	$('#main.screen .buttons > li > a').click(function(e) {
		var href = $(this).attr('href');

		if (href.startsWith('#')) {
			showEvent(href.substr(1));
		}
	});

	$('#user.screen .interests > li > a').click(function(e) {
		e.preventDefault();

		$(this).toggleClass('active');
	});

	function toggleMenu() {
		$('#menu').toggleClass('open');
		$('#blind').toggleClass('open');
		$('#screens').toggleClass('close');
	}

	function showEvent(id) {
		$.ajax({
			dataType: 'json',
			url: '/event.php',
			data: {
				'action': 'get',
				'id': id
			},
			success: function(event) {
				showMap(event.address);

				var starBtnEl = $('#star-btn'),
					followBtnEl = $('#info.screen #follow');

				if (event.status == 'starred') {
					starBtnEl.addClass('active');
				} else {
					starBtnEl.removeClass('active');
				}

				if (event.status == 'scheduled') {
					followBtnEl.addClass('active');
				} else {
					followBtnEl.removeClass('active');
				}

				$('#info.screen').data('eventId', event.id);
				$('#info.screen .brief .title').html(event.title);
				$('#info.screen .count').html(event.follows);
				$('#info.screen .date').html(event.date);
				$('#info.screen .time').html(event.time);
				$('#info.screen .category').html(event.category);

				$('#screens .screen').hide();
				$('#info.screen').show();
			}
		});
	}

	function showMap(address) {
		var geocoder = new google.maps.Geocoder(),
			map = new google.maps.Map($('#map').get(0), {
				zoom: 17,
				disableDefaultUI: true//,
				//styles: GMAP_STYLE
			}),
			url = 'https://www.google.com/maps/?q='+address;

		geocoder.geocode({'address': address}, function(results, status) {
			if (status === 'OK') {
				var pos = results[0].geometry.location,
					marker = new google.maps.Marker({
						position: pos,
						map: map
					});
				
				map.setCenter(pos);
			}
		});

		$('#info.screen #map-link').attr('href', url);
	}

	function pageChange() {
		if (location.hash != '') {
			showEvent(location.hash.substr(1));
		} else {
			$('#screens .screen').hide();
			$('#main.screen').show();
		}
	}
});