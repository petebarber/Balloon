var http = require('http'),
    connect = require('connect');

function REST(req, res, next)
{
	console.log('method:%s, url:%s', req.method, req.url)
	if (req.method == 'POST' && req.url == '/balloon')
	{
		//var sql = "sql=INSERT INTO 1Vjy6Nr22wZgNtmazDhrcf0ngm6H_VposCzIiWV8 (email, Location, Date) VALUES ('foo@bar.com', '', '')";
		//var enSql = encodeURI(sql);

		//$.post("https://www.google.com/fusiontables/api/query", enSql,
		//    function() { alert("Success"); }).error(function() { alert("Whoops!");  });
		// TODO: Make call to Fusion API

		var body = "";

		req.on('data', function(data) { body += data; });
		req.on('end', function()
		{
			console.log("Post data:" + body);

			res.setHeader('Content-Type', 'application/json');
			res.end();
		});
	}
	else
		next();
}

var app = connect()
    .use(connect.logger())
    .use(connect.static('app/client'))
	.use(connect.static('app/common'))
    .use('/api', REST);

http.createServer(app).listen(3000);
