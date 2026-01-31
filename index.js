const http = require('http');
const fs = require('fs')


const server = http.createServer((request, response) => {
  
  const { url, method } = request;

  const redirectURL = resolveRequest(url);
  
  response.writeHead(308, { 'Content-Type': 'text/plain', 'location': redirectURL});
  response.end(`You made a ${method} request to ${url}`);
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

function resolveRequest(requestURL){
  redirectURL = '';
  
  console.log(redirectURL);
  if(requestURL == '/'+'TTT'){
    redirectURL = 'https://vault.keiran.club';
  }
  else{
    redirectURL = 'https://keiran.club';
  }

  return redirectURL;
}