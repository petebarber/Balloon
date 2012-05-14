var http = require('http'),
	connect = require('connect'),
	fs = require('fs'),
	authWithGoogle = require('./authWithGoogle');

function getConfig()
{
	var config = { email: process.env.jbemail, passwd: process.env.jbpasswd };

	if (!config.email || !config.passwd)
	{
		try
		{
			var configText = fs.readFileSync("config.json", "utf8");
			config = JSON.parse(configText);
		}
		catch (e)
		{
			console.log("Couldn't obtain username & password:" + e);
		}
	}

	return config;
}

function REST(req, res, next)
{
	console.log('method:%s, url:%s', req.method, req.url);
	if (req.method == 'POST' && req.url == '/balloon')
	{
		var body = "";

		req.on('data', function(data) { body += data; });
		req.on('end', function()
		{
			console.log("Post data:" + body);

			var balloonFindData = JSON.parse(body);

			authWithGoogle.getAuth(config.email, config.passwd,
				function(authToken)
				{
					console.log("Auth(REST):" + authToken);

					// TODO: Check that balloon id is valid.  Return error if not

					var sql = "INSERT INTO 1Pv7rczTgcbKhMYPCrEseg9T-EJVcTtSUXxtTp8U (email, Location, Date) VALUES ("
							+ "'" + balloonFindData.email + "',"
							+ "'<Point><coordinates> " + balloonFindData.lng + "," + balloonFindData.lat
							+ " </coordinates></Point>',"
							+ "'')";

					authWithGoogle.insert(sql, authToken,
						function()
						{
							res.statusCode = 204; // Success but no content
							res.end();
						},
						function()
						{
							res.statusCode = 500;
							res.status = "Unable to update database";
							res.end();
						})
				})
		});
	}
	else
		next();
}

function MakeStop(httpErrorCode)
{
	return function(req, res)
	{
		res.statusCode = httpErrorCode;
		res.statusMessage = "Hippos are loose in the computer";
		res.end();
	}
}

var config = getConfig();

var app = connect()
    .use(connect.logger())
    .use(connect.static('App/Client'))
	.use(connect.static('App/Common'))
	//.use(MakeStop(204))
    .use('/api', REST);
	// TODO: Add .use(myErrorHandler);

http.createServer(app).listen(process.env.PORT || 3000);
