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

function WriteResponse(res, statusCode, status)
{
	if (statusCode)
		res.statusCode = statusCode;

	if (status)
		res.status = status;

	res.end();
}

function Insert(authToken, res, balloonFindData)
{
	console.log("Auth(REST):" + authToken);

	// TODO: Check that balloon id is valid.  Return error if not
	// TODO: Check that email and balloon have not already been entered.

	var sql = "INSERT INTO 1Pv7rczTgcbKhMYPCrEseg9T-EJVcTtSUXxtTp8U (date, email, id, location) VALUES ("
		+ "'" + new Date()				+"',"
		+ "'" + balloonFindData.email	+ "',"
		+ "'" + balloonFindData.id		+ "',"
		+ "'<Point><coordinates> " + balloonFindData.lng + "," + balloonFindData.lat
		+ " </coordinates></Point>')";

	authWithGoogle.insert(sql, authToken,
		function() { WriteResponse(res, 204) },
		function() { WriteResponse(res, 500, "Unable to update database") });
}

function ThrowIfNotValid(balloonFindData)
{
	if ((balloonFindData.email	== undefined)	||
		(balloonFindData.id		== undefined) 	||
		(balloonFindData.lat	== undefined)	||
		(balloonFindData.lng	== undefined))
		throw Error("Incomplete balloon find data");
}

function HandleBalloon(req, res)
{
	var balloonFindData = req.body;

	ThrowIfNotValid(balloonFindData);

	authWithGoogle.getAuth(config.email, config.passwd,
		function(auth) { Insert(auth, res, balloonFindData); },
		function() { WriteResponse(res, 500, "Failed to login to dB"); }
	);
}

function REST(req, res, next)
{
	console.log('method:%s, url:%s', req.method, req.url);
	console.log("Post data:" + req.body);

	if (req.url == "/balloon")
		HandleBalloon(req, res);
	else
		next();
}

function MakeStop(httpErrorCode)
{
	return function(req, res)
	{
		WriteResponse(res, httpErrorCode, "Hippos are loose in the computer");
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
