const http = require('http');
const fs = require('fs');
const pg = require('pg');



const client = new pg.Client({
  user: process.env.DATABASEUSER,
  password: process.env.DATABASEPASSWORD,
  host: process.env.DATABASEHOST,
  port: process.env.DATABASEPORT,
  database: process.env.DATABASENAME,
})

client.connect();

const server = http.createServer(async (request, response) => {

  const { url, method } = request;

  try {
    const redirectURL = await resolveRequest(url)
  } 
  catch (err){
    console.log(err)
  }

  response.writeHead(308, { 'Content-Type': 'text/plain', 'location': redirectURL});
  response.end(`You made a ${method} request to ${url}`);
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

async function resolveRequest(requestURL){
  redirectURL = '';

  console.log(requestURL);
  requestURL = requestURL.replace('/', '')
  console.log(requestURL);

  try {
  	const result = await client.query("SELECT * from links where shorturl = '" + requestURL+"';");
  	redirectURL = 'https://' + result.rows[0]['longurl'];
  }
  catch (err) {
    console.log('DB error: ' + err)
    console.log('URL doesnt exit or db error')
  }

  return redirectURL;
}
