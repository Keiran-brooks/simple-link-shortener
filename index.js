let http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('WELCOME! This is short.keiran.club! ...');
}).listen(8080);