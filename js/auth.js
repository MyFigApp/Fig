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
	}
});