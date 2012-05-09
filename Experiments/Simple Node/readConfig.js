var http = require('http'), fs = require('fs');

var configText = fs.readFileSync("config.txt");
var config = JSON.parse(configText);

var server = http.createServer(function(req, res)
{
	console.log("Received connection");
	res.write(config);
	res.end();
});

console.log("Hello, node");
console.log("Config:" + config);
console.log("Email address:" + config.email);
console.log("Password:" + config.passwd);
server.listen(3000, '127.0.0.1');