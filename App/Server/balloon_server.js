var http = require('http'),
	connect = require('connect'),
	fs = require('fs'),
	authWithGoogle = require('./authWithGoogle');

var TableT1Id = "1Pv7rczTgcbKhMYPCrEseg9T-EJVcTtSUXxtTp8U";
var TableIdId = "1SpqOILadp0zfEVFj5rTZhyse891m1Hh0SGFdiuE";

function getConfig()
{
	var config =
	{
		email: process.env.jbemail,
		passwd: process.env.jbpasswd,
		reCaptchaKey: process.env.reCaptchaKey
	};

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

function WriteResponse(res, statusCode, opErrorText)
{
	var opRes = {};

	if (opErrorText == undefined)
		opRes.success = true;
	else
	{
		opRes.success = false;
		opRes.reason = opErrorText;
	}

	var body = JSON.stringify(opRes);

	res.writeHead(statusCode,
		{
			'Content-Length' : body.length,
			'Content-type' : 'application/json; charset=utf-8'
		});

	res.end(body);
}

function InsertBalloon(authToken, res, balloonFindData)
{
	console.log("Auth(REST):" + authToken);

	var sql = "INSERT INTO " + TableT1Id + " (date, email, id, location) VALUES ("
		+ "'" + new Date()				+"',"
		+ "'" + balloonFindData.email	+ "',"
		+ "'" + balloonFindData.id		+ "',"
		+ "'<Point><coordinates> " + balloonFindData.lng + "," + balloonFindData.lat
		+ " </coordinates></Point>')";

	authWithGoogle.postFusion(sql, authToken,
		function() { WriteResponse(res, 201) },
		function() { WriteResponse(res, 200, "Unable to update database") });
}

function ProceedIfInsertValid(authToken, res, balloonFindData)
{
	var sqlQueryId = "SELECT Id FROM " + TableIdId + " WHERE Id = '" + balloonFindData.id + "'";

	function isValidBalloonId(fusionData) {
		return fusionData.split('\n').length == 3;
	}

	function isBalloonAlreadyRegistered(fusionData) {
		return fusionData.split('\n').length != 2;
	}

	authWithGoogle.getFusion(sqlQueryId, authToken,
		function(fusionData)
		{
			if (isValidBalloonId(fusionData) == false)
			{
				console.log("Attempt to register a non-existant balloon:" + balloonFindData.id);
				WriteResponse(res, 200, "This balloon has already been found or doesn't exist");
				return;
			}

			var sqlQueryFound = "SELECT id FROM " + TableT1Id + " WHERE id='" + balloonFindData.id + "'";

			authWithGoogle.getFusion(sqlQueryFound, authToken,
				function(fusionData)
				{
					if (isBalloonAlreadyRegistered(fusionData))
					{
						console.log("Attempt to register an already registered balloon:" + balloonFindData.id +
									", by:" + balloonFindData.email);
						WriteResponse(res, 200, "This balloon has already been found or doesn't exist");
					}
					else
						InsertBalloon(authToken, res, balloonFindData);
				});
		}
	);
}

function AuthBalloon(res, balloonFindData)
{
	authWithGoogle.getAuth(config.email, config.passwd,
		function(authToken) { ProceedIfInsertValid(authToken, res, balloonFindData); },
		function() { WriteResponse(res, 200, "Failed to login to dB"); }
	);
}

function ThrowIfNotValid(balloonFindData)
{
	if ((balloonFindData.email				== undefined)	||
		(balloonFindData.id					== undefined) 	||
		(balloonFindData.lat				== undefined)	||
		(balloonFindData.lng				== undefined)	||
		(balloonFindData.captchaChallenge	== undefined)	||
		(balloonFindData.captchaResponse	== undefined))
		throw Error("Incomplete balloon find data");
}

function HandleBalloon(req, res)
{
	var balloonFindData = req.body;

	if (config.skipCaptcha && config.skipCaptcha == "true")
	{
		AuthBalloon(res, balloonFindData);
		return;
	}

	ThrowIfNotValid(balloonFindData);

	authWithGoogle.checkCaptcha(	balloonFindData.captchaChallenge, balloonFindData.captchaResponse,
									req.connection.remoteAddress, config.reCaptchaKey,
		function() { AuthBalloon(res, balloonFindData); },
		function() { console.log("Bad CAPTCHA"); WriteResponse(res, 200, "Bad CAPTCHA"); }
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
	//.use(MakeStop(450))
	.use(connect.limit('32kb'))
	.use('/api', connect.bodyParser())
	.use('/api', REST);

http.createServer(app).listen(process.env.PORT || 3000);
