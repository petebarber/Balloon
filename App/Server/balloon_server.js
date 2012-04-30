var http = require('http'),
    connect = require('connect');

var app = connect()
    .use(connect.logger())
    .use(connect.static('app/client'));

http.createServer(app).listen(3000);
