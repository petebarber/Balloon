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

function ThrowIfNotValid(balloonFindData)
{
	if ((balloonFindData.email	== undefined)	||
		(balloonFindData.id		== undefined) 	||
		(balloonFindData.lat	== undefined)	||
		(balloonFindData.lng	== undefined))
		throw Error("Incomplete balloon find data");
}

function REST(req, res, next)
{
	console.log('method:%s, url:%s', req.method, req.url);
	console.log("Post data:" + req.body);

	var balloonFindData = req.body;

	ThrowIfNotValid(balloonFindData);

	authWithGoogle.getAuth(config.email, config.passwd,
		function(authToken)
		{
			console.log("Auth(REST):" + authToken);

			// TODO: Check that balloon id is valid.  Return error if not
			// TODO: Check that email and balloon have not already been entered.

			// TODO: Add Balloon id (and to table def. as well)
			var sql = "INSERT INTO 1Pv7rczTgcbKhMYPCrEseg9T-EJVcTtSUXxtTp8U (date, email, id, location) VALUES ("
				+ "'" + balloonFindData.email + "',"
				+ "'<Point><coordinates> " + balloonFindData.lng + "," + balloonFindData.lat
				+ " </coordinates></Point>',"
				+ "'" + balloonFindData.id + "')";

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
				});
		});
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
	.use('/api', connect.bodyParser())
	.use('/api', REST);
	// TODO: Add .use(myErrorHandler);

http.createServer(app).listen(process.env.PORT || 3000);
