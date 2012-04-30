var http = require('http'),
    connect = require('connect');

var app = connect()
    .use(connect.logger())
    .use(connect.static('staticfiles'));

console.log(process.cwd());

http.createServer(app).listen(3000);