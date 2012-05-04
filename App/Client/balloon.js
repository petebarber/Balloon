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
	return "http://batcat:3000/api";
}

function Init(startingPos)
{
    $("#submitLocation")[0].disabled = true;

	var baseURL = getBaseUrl();
    var isSubmitted = false;
    var lastMarker;

    var myOptions = {
        center: startingPos,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map($("#map_canvas")[0], myOptions);

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

    var mapClickListener = google.maps.event.addListener(map, 'click', function(evt)
        {
            if (lastMarker)
                lastMarker.setMap(null);
            else
                $("#submitLocation")[0].disabled = false;

            lastMarker = new google.maps.Marker({ position: evt.latLng, map: map });

            lastMarker.setTitle("Here");
        })

     $("#submitLocation")[0].onclick = function()
     {
        this.disabled = true;
        google.maps.event.removeListener(mapClickListener);

	    var x = new google.maps.LatLng(51.324873, -0.576696);

        $.post(baseURL + '/balloon', new BalloonFind("me@foo.com", x.lat(), x.lng()));
     }
}