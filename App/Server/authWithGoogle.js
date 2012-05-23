exports.checkCaptcha = function(challenge, response, remoteIp, privateKey, onsuccess, onerror)
{
	var http  = require('http');

	var data = 	"privatekey="	+ encodeURIComponent(privateKey)+
				"&remoteip="	+ encodeURIComponent(remoteIp)	+
				"&challenge="	+ encodeURIComponent(challenge) +
				"&response="	+ encodeURIComponent(response);

	console.log("checkCapturePostBody:" + data);

	var options =
	{
		host: 'www.google.com',
		port: 80,
		path: '/recaptcha/api/verify',
		method: 'POST',
		headers:
		{
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length' : Buffer.byteLength(data, 'utf8')
		}
	}

	var req = http.request(options,
		function(res)
		{
			var data = "";

			res.on('data', function(chunk) { data += chunk; });

			res.on('end',
				function()
				{
					console.log("headers: ", res.headers);
					console.log("statusCode: ", res.statusCode);

					if (res.statusCode != 200)
					{
						console.error("checkCaptcha (verification failed):" + res.status + " - " + res.statusCode);
						onerror && onerror();
						return;
					}

					console.log("Captcha verificaiton response:" + data);

					var lines = data.split('\n');

					if (lines[0] == "true")
						onsuccess && onsuccess();
					else
						onerror && onerror();
				});
		});

	req.on('error',
		function(e)
		{
			console.error("checkCaptcha error:" + e);
			onerror && onerror();
		});

	req.write(data);
	req.end();

}

exports.getAuth = function(username, password, onsuccess, onerror)
	{
		var https = require('https');

		var data = "Email=" + username + "&Passwd=" + password +"&service=fusiontables&source=test";

		console.log("getAuthPostBody" + data);

		var options =
		{
			host: 'www.google.com',
			port: 443,
			path: '/accounts/ClientLogin',
			method: 'POST',
			headers:
			{
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(data, 'utf8')
			}
		}

		var req = https.request(options,
			function(res)
			{
				console.log("statusCode: ", res.statusCode);

				if (res.statusCode != 200)
				{
					console.error("getAuth (failed to auth):" + res.status + " - " + res.statusCode);
					onerror && onerror();
					return;
				}

				// TODO: Handle 200
				// TODO: Handle 403
				// TODO: Handle captcha
				// TODO: Handle all other codes

				console.log("headers: ", res.headers);

				res.on('data',
					function(dataObj)
					{
						console.log("getAuthRecieveBody" + dataObj);

						var data = dataObj.toString();

						auth = data.slice(data.search("Auth=") + 5, data.length);
						auth = auth.replace(/\n/g, "");

						onsuccess && onsuccess(auth);
					});
			});

		req.on('error',
			function(e)
			{
				console.error("getAuth error:" + e);
				onerror && onerror();
			});

		req.write(data);
		req.end();

	}

callFusion = function(method, sql, authToken, onsuccess, onerror)
{
	var https = require('https');

	var options =
	{
		host: 'www.google.com',
		port: 443,
		path: '/fusiontables/api/query',
		method: method,
		headers: { 'Authorization' : 'GoogleLogin auth=' + authToken }
	}

	var fusionCmd = "sql=" + encodeURI(sql);

	console.log("Fusion Command(" + method + "):" + fusionCmd);

	if (method == 'GET')
	{
		options.path += "?";
		options.path += fusionCmd;
	}
	else
	{
		options.headers["Content-Type"] 	= "application/x-www-form-urlencoded";
		options.headers["Content-Length"]	= Buffer.byteLength(fusionCmd, 'utf8');
	}

	var req = https.request(options,
		function(res)
		{
			var data = "";

			res.on('data', function(chunk) { data += chunk; });

			res.on('end',
				function()
				{
					console.log("headers: ", res.headers);
					console.log("statusCode: ", res.statusCode);
					console.log("callFusionReceiveBody: *begin*" + data + "*end*");

					if (res.statusCode != 200)
					{
						console.error("Fusion error:" + res.status + " - " + res.statusCode);
						onerror && onerror();
						return;
					}

					onsuccess && onsuccess(data);
				});

		});

	req.on('error',
		function(e)
		{
			console.error("Fusion submission error:" + e);
			onerror && onerror();
		});

	if (method == 'POST')
		req.write(fusionCmd);

	req.end();
}

exports.getFusion = function(sql, authToken, onsuccess, onerror)
{
	callFusion('GET', sql, authToken, onsuccess, onerror);
}

exports.postFusion = function(sql, authToken, onsuccess, onerror)
{
	callFusion('POST', sql, authToken, onsuccess, onerror);
}





