var http = require('http'),
    connect = require('connect');

function REST(req, res, next)
{
	console.log('method:%s, url:%s', req.method, req.url)
	if (req.method == 'POST' && req.url == '/balloon')
	{
		res.setHeader('Content-Type', 'application/json');
		res.end();
	}
	else
		next();
}

var app = connect()
    .use(connect.logger())
    .use(connect.static('app/client'))
    .use('/api', REST);

http.createServer(app).listen(3000);
