exports.getAuth = function(username, password, onsuccess, onerror)
	{
		var https = require('https');

		var data = "Email=" + username + "&Passwd=" + password +"&service=fusiontables&source=test";

		console.log("data:" + data);

		var options =
		{
			host: 'wwwfoo.google.com',
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

				// TODO: Handle non-200 status

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
				onerror && onerror(e);
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

			// TODO: Handle non-200 status

			res.on('data', function(dataObj)
			{
				console.log("Data:" + dataObj);

				onsuccess && onsuccess();
			});

		});

	req.on('error',
		function(e)
		{
			console.error("Insert error:" + e);
			onerror && onerror(e);
		});

	req.write(data);
	req.end();
}







