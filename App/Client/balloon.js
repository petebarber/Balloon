jQuery(function () {
	var horsellHighStreetPos = new google.maps.LatLng(51.324873, -0.576696);

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function (pos) {
				Init(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			},
			function () {
				Init(horsellHighStreetPos);
			});
	}
	else
		Init(horsellHighStreetPos);
});

function getBaseUrl()
{
	var baseUrl = location.protocol + "//" + location.hostname + ":" + location.port;
	return baseUrl;
}

function Init(startingPos)
{
	var baseURL = getBaseUrl();
	var lastMarker;
	var isSubmitted = false;

    $("#submitLocationButton")[0].disabled = true;
	$('#findLocationForm > input[type="submit"]')[0].disabled = true;

	$('#submitLocationForm > input').keyup(UpdateSubmitButton);
	$("#findLocationForm > input").keyup(
		function()
		{
			$('#findLocationForm > input[type="submit"]')[0].disabled = $("#findLocation").val() == "";
		});


	var myOptions = {
        center: startingPos,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map($("#map_canvas")[0], myOptions);

	var mapClickListener = google.maps.event.addListener(map, 'click',
		function(evt)
		{
			if (lastMarker)
				lastMarker.setMap(null);

			lastMarker = new google.maps.Marker({ position: evt.latLng, map: map });

			lastMarker.setTitle("Excellent, you found a balloon here.");

			UpdateSubmitButton();
		});

	$('#findLocationForm')[0].onsubmit =
		function()
        {
            var geoCodeMap = {};
            geoCodeMap["address"] = $("#findLocation").val();

            var geoCoder = new google.maps.Geocoder();

            geoCoder.geocode(geoCodeMap , function(results, status)
                {
                    if (status == google.maps.GeocoderStatus.OK)
                    {
                        map.setCenter(results[0].geometry.location);
                        map.setZoom(16);
                    }
                    else
                        alert("Whoops:" + status);
                });

            return false;
        };

	function UpdateSubmitButton()
	{
		var empty = false;
		$('#submitLocationForm > input').each(function()
		{
			if ($(this).val() == '')
			{
				empty = true;
			}
		});

		if (empty || isSubmitted || !lastMarker)
		{
			$('#submitLocationButton').attr('disabled', true);
		} else
		{
			$('#submitLocationButton').attr('disabled', false);
		}
	}

	function validateSubmitLocationForm(finderEmail, balloonId)
	{
		if (!finderEmail || !balloonId)
		{
			alert("Please make your you've entered your email address and the balloon number");
			return false;
		}

		return true;
	}

     $("#submitLocationForm")[0].onsubmit = function()
     {
		var finderEmail = $("#finderEmail").val();
		var balloonId = $("#balloonId").val();

		if (validateSubmitLocationForm(finderEmail, balloonId) == false)
			return false;

		isSubmitted = true;

		UpdateSubmitButton();

        google.maps.event.removeListener(mapClickListener);

	    var x = lastMarker.getPosition();

		var y = new BalloonFind(finderEmail, balloonId, x.lat(), x.lng());

        $.ajax(
			{
				url : baseURL + '/api/balloon',
				type : 'POST',
				data : JSON.stringify(y),
				dataType: 'json',
				contentType : "application/json; charset=utf-8"
	 		})
			.success(function()
			{
				alert("Thanks for finding a balloon.  Please check your email after the 10th of June.");
			})
			.error(function(e)
			{
				alert("Whoops! Something went wrong:" + e.statusText + "(" + e.status + "). Please try again.");
				location.reload();
			});

		return false;
     }
}