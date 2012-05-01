var http = require('http');

var server = http.createServer(function(req, res)
{
    console.log("Received connection");

   res.setHeader('Content-Type', 'application/json');

   var book =
   {
       "title" : "JavaScript",
       ISBN : "1234",
       author :
       {
           firstname : "David",
           surname : "Flanagan"
       }
   };

   res.end(JSON.stringify(book));
});

console.log("Hello, REST WS");
server.listen(3000, 'batcat');
