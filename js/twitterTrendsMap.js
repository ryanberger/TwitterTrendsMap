var map;
var trendingLocations = [];
var markers = [];
var geocoder = new google.maps.Geocoder();
var twitterString = '<a class="twitter-timeline" data-dnt=true href="https://twitter.com/search?q=%23corgi" data-widget-id="298512075787993088">Tweets about "#corgi"</a>';

function initialize() {
	var myOptions = {
		zoom: 3,
		// Start map roughly in the middle of the Atlantic Ocean
		center: new google.maps.LatLng(25.4419, -30.1419),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map_canvas'),
		myOptions);

	getTrendingCities();
}

function getTrendingCities() {
	$.getJSON('data/locationData.json', function(data) {
		$.each(data, function (i, item) {
			setCityMarker(item.address, item.woeid, item.latitude, item.longitude);
		});
	});
}

function setCityMarker(address, woeid, latitude, longitude) {
	var marker = new google.maps.Marker({
		map: map,
		animation: google.maps.Animation.DROP,
		position: new google.maps.LatLng(latitude, longitude)
	});

	google.maps.event.addListener(marker, 'click', function() {
		getWoeid(latitude, longitude, marker);
	});
}

function getWoeid(latitude, longitude, marker) {
	$.ajax({
		url: 'https://api.twitter.com/1/trends/available.json',
		dataType: 'jsonp',
		data: { 'lat': latitude, 'long': longitude },
		success: function (data) {
			openPopup(data[0].woeid, marker);
		}
	});
}

function openPopup(woeid, marker) {
	$.ajax({
		url: 'https://api.twitter.com/1/trends/' + woeid + '.json',
		dataType: 'jsonp',
		success: function (data) {
			var headers = $('<div>').append('<div id="accordion">');

			$.each(data, function (i, location) {
				$.each(location.trends, function (i, item) {
					headers.children().first().append('<h3>' + item.name + '</h3>').append('<div>'+ twitterString +'</div>');
				});
			});

			headers.children().first().append('</div></div>');
			
			var infowindow = new google.maps.InfoWindow({
				content: data[0].locations[0].name + '<br/>' + headers.html()
			});
			
			google.maps.event.addListener(infowindow, 'domready', function() {
				$("#accordion").accordion({collapsible: true, active: false });
			});
			
			$("#accordion").accordion({collapsible: true, active: false });
			infowindow.open(map, marker);
		}
	});
}

function loadScript() {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'http://maps.googleapis.com/maps/api/js?sensor=true&callback=initialize';
	document.body.appendChild(script);
}

String.prototype.format = function() {
    var s = this, i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

$(loadScript);