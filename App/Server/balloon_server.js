var http = require('http'),
    connect = require('connect'),
	fs = require('fs'),
	authWithGoogle = require('./authWithGoogle')

function getConfig()
{
	console.log(process.env);

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
	console.log('method:%s, url:%s', req.method, req.url)
	//if (req.method == 'POST' && req.url == '/balloon')
	if (true)
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
					console.log("Auth(REST):" + auth);

					// TODO: Check that balloon id is valid.  Return error if not

					var sql = "INSERT INTO 1Pv7rczTgcbKhMYPCrEseg9T-EJVcTtSUXxtTp8U (email, Location, Date) VALUES ("
							+ "'" + balloonFindData.email + "',"
							+ "'<Point><coordinates> " + balloonFindData.lng + "," + balloonFindData.lat
							+ " </coordinates></Point>',"
							+ "'')";

					authWithGoogle.insert(sql, authToken,
						function()
						{
							res.setHeader('Content-Type', 'application/json');
							res.end();
						});
				},
				function(e)
				{
					next();
				})
		});
	}
	else
		next();
}

var config = getConfig();

var app = connect()
    .use(connect.logger())
    .use(connect.static('App/Client'))
	.use(connect.static('App/Common'))
    .use(REST);

http.createServer(app).listen(process.env.PORT || 3000);
