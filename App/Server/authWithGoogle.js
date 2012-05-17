exports.getAuth = function(username, password, onsuccess, onerror)
	{
		var https = require('https');

		var data = "Email=" + username + "&Passwd=" + password +"&service=fusiontables&source=test";

		console.log("data:" + data);

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
						console.log("Data:" + dataObj);

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

exports.insert = function(sql, authToken, onsuccess, onerror)
{
	var https = require('https');

	var data = "sql=" + sql;

	console.log("data:" + data);

	var options =
	{
		host: 'www.google.com',
		port: 443,
		path: '/fusiontables/api/query',
		method: 'POST',
		headers:
		{
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization' : 'GoogleLogin auth=' + authToken,
			'Content-Length' : Buffer.byteLength(data, 'utf8')
		}
	}

	var req = https.request(options,
		function(res)
		{
			console.log("statusCode: ", res.statusCode);
			console.log("headers: ", res.headers);

			if (res.statusCode != 200)
			{
				console.error("Insert error:" + res.status + " - " + res.statusCode);
				onerror && onerror();
				return;
			}

			res.on('data', function(dataObj)
			{
				console.log("Data:" + dataObj);

				onsuccess && onsuccess();
			});

		});

	req.on('error',
		function(e)
		{
			console.error("Insert submission error:" + e);
			onerror && onerror();
		});

	req.write(data);
	req.end();
}







