var https = require('https');

function makeHeader(data)
{
    var hdr =
    {
        'Content-Type' : "application/x-www-form-urlencoded",
        'Content-Length' : Buffer.byteLength(data, 'utf8')
    };

    return hdr;
}

var data = "Email=email@gmail.com&Passwd=passwd&service=fusiontables&source=test";

console.log("data:" + data);

var options =
{
    host: 'www.google.com',
    port: 443,
    path: '/accounts/ClientLogin',
    method: 'POST',
    headers:
    {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' : Buffer.byteLength(data, 'utf8')
    }
}

// console.log("options:" + JSON.stringify(options));
//var req = https.request(options, '/accounts/ClientLogin', makeHeader(data));

var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);

    res.on('data', function(d) {
        process.stdout.write(d);
    });
});

req.end();

req.on('error', function(e) {
    console.error(e);
});

req.write(data);
req.end();

