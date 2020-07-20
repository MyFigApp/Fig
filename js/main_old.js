$(window).on('load', function() {
	$('#preloader').animate({
		'opacity': 0
	}, 250,
	function() {
		$(this).hide();
	});
});

$(document).ready(function() {
	if (isMobile.any) {
		$('.layer').addClass('is-mobile');

		$('#main.screen .write-us.mobile').addClass('active');
		$('#main.screen .write-us.mobile').addClass('current');
	} else {
		$('#main.screen .write-us.desktop').addClass('active');
		$('#main.screen .write-us.desktop').addClass('current');
	}

	var gsUrl = 'https://script.google.com/macros/s/AKfycbw6Ftd1ZEWkBoqUz-PSlb6ST_8h3pnUYrBvMYnhm5ZeQgD0-zmy/exec',
		activityTimeout = 10*60*1000,
		activityTimer = setTimeout(logout, activityTimeout);

	setInterval(function() {
		$.ajax({
			url: gsUrl,
			type: 'POST',
			data: {
				'type': 'clear'
			}
		});
	}, 3000);

	$(window).on('touchmove', rechargeTimer);
	$(window).on('scroll', rechargeTimer);
	$(window).on('click', rechargeTimer);
	$(window).on('blur', rechargeTimer);
	$(window).on('popstate', function() {
		//$('#menu').addClass('open');
		//$('#screens').addClass('close');
		//$('#blind').addClass('open');

		openMenu();

		//onHashChange();
		rechargeTimer();
	});
	//onHashChange();

	detectSwipe($(window), function(el, direction) {
		switch (direction) {
			case 'l': {
				//$('#menu').removeClass('open');
				//$('#blind').removeClass('open');
				//$('#screens').removeClass('close');

				closeMenu();

				break;
			}
			case 'r': {
				//$('#menu').addClass('open');
				//$('#blind').addClass('open');
				//$('#screens').addClass('close');

				openMenu();

				break;
			}
		}
	});

	$('#menu-btn').on('click', function(e) {
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

	$('#filter-btn').on('click', function(e) {
		e.preventDefault();

		/**/
	});

	$('#star-btn').on('click', function(e, triggered) {
		e.preventDefault();

		var btnEl = $(this),
			id = $('#info.screen').data('eventId'),
			followBtnEl = $('#info.screen #follow'),
			eventEl = $('#main.screen .events > li > a[data-event-id="'+id+'"]'),
			starredCountEl = $('#menu .list > li > a[data-status="starred"] .count'),
			starredCountVal = starredCountEl.text().trim(),
			starredCount = (starredCountVal != '') ? parseInt(starredCountVal) : 0,
			status = 'None';

		btnEl.toggleClass('active');

		if (btnEl.hasClass('active')) {
			status = 'starred';
			starredCount++;
		} else {
			starredCount--;
		}

		if (triggered == null) {
			if (followBtnEl.hasClass('active')) {
				followBtnEl.trigger('click', [true]);
			}

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

			$.ajax({
				url: gsUrl,
				type: 'POST',
				data: {
					'type': 'star',
					'event': id
				}
			});
		}

		if (starredCount > 0) {
			starredCountEl.text(starredCount);
		} else {
			starredCountEl.text('');
		}

		eventEl.data('status', status);
	});

	$('#info.screen #follow').on('click', function(e, triggered) {
		e.preventDefault();

		if (!$('#info.screen').hasClass('past')) {
			var btnEl = $(this),
				id = $('#info.screen').data('eventId'),
				starBtnEl = $('#star-btn'),
				eventEl = $('#main.screen .events > li > a[data-event-id="'+id+'"]'),
				scheduledCountEl = $('#menu .list > li > a[data-status="scheduled"] .count'),
				scheduledCountVal = scheduledCountEl.text().trim(),
				scheduledCount = (scheduledCountVal != '') ? parseInt(scheduledCountVal) : 0,
				followsCountEl = $('#info.screen .count'),
				followsCount = parseInt(followsCountEl.text().trim()),
				status = 'None';

			btnEl.toggleClass('active');

			if (btnEl.hasClass('active')) {
				status = 'scheduled';
				followsCount++;
				scheduledCount++;
				btnEl.text(btnEl.data('active'));
			} else {
				followsCount--;
				scheduledCount--;
				btnEl.text(btnEl.data('inactive'));
			}

			if (triggered == null) {
				if (starBtnEl.hasClass('active')) {
					starBtnEl.trigger('click', [true]);
				}

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

				$.ajax({
					url: gsUrl,
					type: 'POST',
					data: {
						'type': 'follow',
						'event': id
					}
				});
			}

			if (scheduledCount > 0) {
				scheduledCountEl.text(scheduledCount);
			} else {
				scheduledCountEl.text('');
			}

			followsCountEl.text(followsCount);

			eventEl.data('status', status);
		}
	});

	$('#blind').on('click', function(e) {
		toggleMenu();
	});

	$('#menu .list > li > a').on('click', function(e) {
		e.preventDefault();

		var btnEl = $(this),
			status = btnEl.data('status');

		changeScreen(status);

		btnEl.addClass('active');

		$.ajax({
			url: gsUrl,
			type: 'POST',
			data: {
				'type': 'status',
				'status': status
			}
		});
	});

	$('#menu .list .categories a').on('click', function(e) {
		e.preventDefault();

		var btnEl = $(this),
			category = btnEl.data('category');

		changeScreen('category_'+category);

		btnEl.addClass('active');

		$.ajax({
			url: gsUrl,
			type: 'POST',
			data: {
				'type': 'category',
				'category': category
			}
		});
	});

	$('#menu #settings').on('click', function(e) {
		e.preventDefault();

		changeScreen('preferences');
	});

	$('#info.screen #guests').on('click', function(e) {
		e.preventDefault();

		changeScreen('under-construction');
	});

	$('#main.screen .events').on('click', '.event', function(e) {
		e.preventDefault();

		var id = $(this).data('eventId');

		changeScreen('event_'+id);

		$.ajax({
			url: gsUrl,
			type: 'POST',
			data: {
				'type': 'event',
				'event': id
			}
		});
	});

	$('#user.screen .interests a').on('click', function(e) {
		e.preventDefault();

		$(this).toggleClass('active');

		var categories = [];

		$('#user.screen .interests a.active').each(function() {
			categories.push($(this).data('category'));
		});

		$.ajax({
			dataType: 'json',
			url: '/interests.php',
			data: {
				'categories': categories
			},
			success: function(results) {
				console.log(results);
			}
		});
	});

	$('#preferences.screen .properties #profile.property').on('click', function(e) {
		e.preventDefault();

		changeScreen('profile');
	});

	$('#preferences.screen .properties #rate.property').on('click', function(e) {
		e.preventDefault();

		changeScreen('rate');
	});

	$('#preferences.screen .properties #interests.property').on('click', function(e) {
		e.preventDefault();

		changeScreen('interests');
	});

	$('#preferences.screen .properties #privacy.property').on('click', function(e) {
		e.preventDefault();

		changeScreen('privacy');
	});

	$('#preferences.screen .properties .trigger').on('click', function(e) {
		e.preventDefault();

		$(this).toggleClass('active');
	});

	$('#info.screen #map-link').on('click', function(e) {
		var id = $('#info.screen').data('eventId');

		$.ajax({
			url: gsUrl,
			type: 'POST',
			data: {
				'type': 'map',
				'event': id
			}
		});
	});

	function rechargeTimer() {
		clearTimeout(activityTimer);
		activityTimer = setTimeout(logout, activityTimeout);
	}

	function logout() {
		clearTimeout(activityTimer);
		activityTimer = null;

		window.location.replace('/?logout');
	}

	function onHashChange() {
		var name = location.hash;

		if (name.length > 1) {
			name = name.substr(1);

			changeScreen(name, false);
		} else {
			changeScreen('upcoming', false);
		}
	}

	function changeScreen(name, changeState) {
		var changeState = (typeof changeState !== 'undefined') ? changeState : true;

		if (changeState && window.history && window.history.pushState) {
			window.history.pushState(null, null, '#'+name);
		}

		//$('#menu').removeClass('open');
		//$('#blind').removeClass('open');
		//$('#screens').removeClass('close');

		closeMenu();

		$('#screens .screen').hide();

		if (name.startsWith('category')) {
			var category = name.substr(name.indexOf('_') + 1);

			showEvents('category', category);
		} else if (name.startsWith('event')) {
			var event_id = name.substr(name.indexOf('_') + 1);

			showEvent(event_id);
		} else {
			switch (name) {
				case 'upcoming':
				case 'scheduled':
				case 'starred':
				case 'past': {
					showEvents('status', name);
					break;
				}
				case 'profile':
				case 'rate': {
					$('#under-construction.screen').show();
					break;
				}
				default: {
					$('#'+name+'.screen').show();
				}
			}
		}
	}

	function toggleMenu() {
		//$('#menu').toggleClass('open');
		//$('#screens').toggleClass('close');
		//$('#blind').toggleClass('open');

		var menuEl = $('#menu'),
			screensEl = $('#screens');

		menuEl.stop();
		screensEl.stop();

		if (!menuEl.hasClass('open')) {
			openMenu();
		} else {
			closeMenu();
		}
	}

	function openMenu() {
		var menuEl = $('#menu'),
			screensEl = $('#screens');
		
		$('#blind').addClass('open');

		menuEl.animate({
			left: '0'
		}, 250, function() {
			menuEl.addClass('open');
		});

		screensEl.animate({
			left: screensEl.width() - 80
		}, 250);
	}

	function closeMenu() {
		var menuEl = $('#menu'),
			screensEl = $('#screens');

		$('#blind').removeClass('open');

		menuEl.animate({
			left: '-100%'
		}, 250, function() {
			menuEl.removeClass('open');
		});

		screensEl.animate({
			left: '0'
		}, 250);
	}

	function showEvent(id) {
		$('#info.screen .loading').show();
		$('#info.screen').show();

		$.ajax({
			dataType: 'json',
			url: '/event.php',
			data: {
				'action': 'get',
				'id': id
			},
			success: function(results) {
				if (results.success) {
					$('#info.screen .loading').hide();

					var event = results.data,
						starBtnEl = $('#star-btn'),
						followBtnEl = $('#info.screen #follow');

					showMap(event.address);

					if (event.status == 'starred') {
						starBtnEl.addClass('active');
					} else {
						starBtnEl.removeClass('active');
					}

					if (event.status == 'scheduled') {
						followBtnEl.addClass('active');
						followBtnEl.html(followBtnEl.data('active'));
					} else {
						followBtnEl.removeClass('active');
						followBtnEl.html(followBtnEl.data('inactive'));
					}

					if (event.is_past) {
						$('#info.screen').addClass('past');
					} else {
						$('#info.screen').removeClass('past');
					}

					$('#info.screen').data('eventId', event.id);
					$('#info.screen .brief .title').html(event.title);
					$('#info.screen .count').html(event.follows);
					$('#info.screen .date').html(event.date);
					$('#info.screen .time').html(event.time);
					$('#info.screen .category').html(event.category);
				}
			}
		});
	}

	function showEvents(property, value) {
		var params = {
			'action': 'list'
		};

		params[property] = value;

		$('#main.screen .loading').show();
		$('#main.screen .events').empty();
		$('#main.screen').show();

		$('#menu .list .categories a').removeClass('active');
		$('#menu .list > li > a').removeClass('active');

		$('#main.screen .write-us.current').removeClass('active');

		if ((property == 'status') && (value == 'upcoming')) {
			$('#main.screen .write-us.current').addClass('active');
		}

		$.ajax({
			dataType: 'json',
			url: '/event.php',
			data: params,
			success: function(results) {
				if (results.success) {
					$('#main.screen .loading').hide();

					var events = results.data;

					$.each(events, function() {
						var liEl = $('<li></li>').appendTo('#main.screen .events'),
							linkEl = $('<a class="event '+ this.status +'" href="#" data-event-id="'+ this.id +'"></a>').appendTo(liEl);

						$('<div class="time"><span class="icon clock"></span>'+ this.date +', '+ this.time +'</div>').appendTo(linkEl);
						$('<div class="title">'+ this.title +'</div>').appendTo(linkEl);

						var infoEl = $('<ul class="info"></ul>').appendTo(linkEl);
						$('<li><span class="icon tags"></span>'+ this.category +'</li>').appendTo(infoEl);
						$('<li><span class="icon users"></span>'+ this.follows +'</li>').appendTo(infoEl);
					});

					if (events.length > 0) {
						$('#main.screen .empty').removeClass('active');
					} else {
						$('#main.screen .empty').addClass('active');
					}	
				}
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

	function detectSwipe(el, callback) {
		var swipe_det = {
				'sX': 0,
				'sY': 0,
				'eX': 0,
				'eY': 0
			},
			min_x = 30,
			max_x = 30,
			min_y = 50,
			max_y = 60,
			direc = '';

		el.on('touchstart', function(e) {
			var t = e.touches[0];

			swipe_det.sX = t.screenX; 
			swipe_det.sY = t.screenY;
		});
		
		el.on('touchmove', function(e) {
			e.preventDefault();

			var t = e.touches[0];

			swipe_det.eX = t.screenX; 
			swipe_det.eY = t.screenY;    
		});
		
		el.on('touchend', function(e) {
			if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
				if (swipe_det.eX > swipe_det.sX) {
					direc = 'r';
				} else {
					direc = 'l';
				}
			} else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
				if (swipe_det.eY > swipe_det.sY) {
					direc = 'd';
				} else {
					direc = 'u';
				}
			}

			if (direc != '') {
				if (typeof callback == 'function') {
					callback(el, direc);
				}
			}

			direc = '';
			swipe_det.sX = 0;
			swipe_det.sY = 0;
			swipe_det.eX = 0;
			swipe_det.eY = 0;
		});  
	}
});