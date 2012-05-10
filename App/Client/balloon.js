jQuery(function()
{
    var horsellHighStreetPos = new google.maps.LatLng(51.324873, -0.576696);

    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(
            function(pos)
            {
                Init(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            },
            function()
            {
                Init(horsellHighStreetPos);
            });
    }
    else
        Init(horsellHighStreetPos);
})

function getBaseUrl()
{
	return "http://firebolt:3000/api";
}

function Init(startingPos)
{
    $("#submitLocationButton")[0].disabled = true;

	var baseURL = getBaseUrl();
    var isSubmitted = false;
    var lastMarker;

    var myOptions = {
        center: startingPos,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map($("#map_canvas")[0], myOptions);

	var mapClickListener = google.maps.event.addListener(map, 'click', function(evt)
	{
		if (lastMarker)
			lastMarker.setMap(null);
		else
			$("#submitLocationButton")[0].disabled = false;

		lastMarker = new google.maps.Marker({ position: evt.latLng, map: map });

		lastMarker.setTitle("Here");
	})

	$('#findLocationForm')[0].onsubmit = function()
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
        }

	function validateSubmitLocationForm(finderEmail, balloonId)
	{
		if (!finderEmail)
		{
			alert("Please enter your email address");
			return false;
		}

		if (!balloonId)
		{
			alert("Please enter the balloon number");
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

		$("#submitLocationButton")[0].disabled = true;

        google.maps.event.removeListener(mapClickListener);

	    var x = lastMarker.getPosition();

		var y = new BalloonFind(finderEmail, balloonId, x.lat(), x.lng());

        $.post(baseURL + '/balloon', JSON.stringify(y), function(){}, 'json');

		 // TODO: Add success & error handlers.  Error handler has to deal with multiple submissions
		 // and bad balloon id.

		return false;
     }
}