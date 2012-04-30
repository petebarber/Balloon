var http = require('http');

var server = http.createServer(function(req, res)
    {
        console.log("Received connection");
        res.write('Hello, world');
        res.end();
    });

console.log("Hello, node");
server.listen(3000, '127.0.0.1');