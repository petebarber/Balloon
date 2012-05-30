jQuery(function () {
	var horsellHighStreetPos = new google.maps.LatLng(51.324873, -0.576696);

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

	$('#submitLocationFormDiv  input').keyup(UpdateSubmitButton);

	$('#captchaDiv').keyup(UpdateSubmitButton);

	$("#findLocationForm > input").keyup(
		function()
		{
			$('#findLocationForm > input[type="submit"]')[0].disabled = $("#findLocation").val() == "";
		});

	if (navigator.geolocation)
	{
		$('#whereami').hover(
			function() { $('#whereamitooltip').css("display", "inline"); },
			function() { $('#whereamitooltip').css("display", "none"); }
		);

		$('#whereami').click(
			function()
			{
				navigator.geolocation.getCurrentPosition(
					function(pos)
					{
						var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

						map.setCenter(latlng);
					}
					,
					function(e)
					{
						$('#whereami').css("display", "none");

						var t = "";

						switch(e.code)
						{
							case e.PERMISSION_DENIED:
								return;
							case e.POSITION_UNAVAILABLE:
								t = "location information is unavailable.";
								break;
							case e.TIMEOUT:
								t = "the request to get user location timed out.";
								break;
						}

						alert("I don't where you are as " + t);
					});
			}
		);
	}
	else
		$('#whereami').css("display", "none");


	var myOptions = {
        center: startingPos,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map($("#map_canvas")[0], myOptions);

	function BalloonMarkerHandler(evt)
	{
		if (lastMarker)
			lastMarker.setMap(null);

		lastMarker = new google.maps.Marker({ position: evt.latLng, map: map });

		lastMarker.setTitle("Excellent, you found a balloon here.");

		UpdateSubmitButton();
	}

	var mapClickListener = google.maps.event.addListener(map, 'click', BalloonMarkerHandler);

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

		$('#submitLocationFormDiv  input').each(
			function()
			{
				if ($(this).val() == '')
				{
					empty = true;
				}
			});

		if (Recaptcha.get_response() == '') empty = true;

		if (empty || isSubmitted || !lastMarker)
		{
			$('#submitLocationButton').attr('disabled', true);
		} else
		{
			$('#submitLocationButton').attr('disabled', false);
		}
	}

	function ReenableFormAfterError()
	{
		isSubmitted = false;
		UpdateSubmitButton();
		mapClickListener = google.maps.event.addListener(map, 'click', BalloonMarkerHandler);

	}

	function validateSubmitLocationForm(finderEmail, balloonId)
	{
		if (!finderEmail || !balloonId || (Recaptcha.get_response() == ''))
		{
			alert("Please make your you've entered your email address, balloon number & the CAPTCHA.");
			return false;
		}

		return true;
	}

     $("#submitLocationForm")[0].onsubmit = function()
     {
		var a = $('#foo');
		var b = $('#foo').val();

		var finderEmail = $("#finderEmail").val();
		var balloonId = $("#balloonId").val();

		if (validateSubmitLocationForm(finderEmail, balloonId) == false)
			return false;

		isSubmitted = true;

		UpdateSubmitButton();

        google.maps.event.removeListener(mapClickListener);

	    var x = lastMarker.getPosition();

		var y = new BalloonFind(finderEmail, balloonId,
								x.lat(), x.lng(),
								Recaptcha.get_challenge(), Recaptcha.get_response());

        $.ajax(
			{
				url : baseURL + '/api/balloon',
				type : 'POST',
				data : JSON.stringify(y),
				dataType: 'json',
				contentType : "application/json; charset=utf-8"
	 		})
			.success(function(opRes, textStatus)
			{
				if (opRes.success == true)
					alert("Thanks for finding a balloon.  Please check your email after the 10th of June.");
				else if (opRes.reason == "Bad CAPTCHA")
				{
					alert("Please try again with the CAPTCHA.");
				}
				else
					alert("Whoops! " + opRes.reason + ". Please try again.");

				Recaptcha.reload();
				ReenableFormAfterError();
			})
			.error(function(e)
			{
				alert("Whoops! Something went wrong: " + e.statusText + " (" + e.status + "). Please try again.");
				ReenableFormAfterError();
			});

		return false;
     }
}