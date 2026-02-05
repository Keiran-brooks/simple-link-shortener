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

  let redirectURL = '';

  try {
    redirectURL = await resolveRequest(url);
  }
  catch (err){
    console.log(err);
  }

  const shouldRedirect = Boolean(redirectURL);

  if (shouldRedirect){
    response.writeHead(308, { 'Content-Type': 'text/plain', 'location': redirectURL});
    response.end(`You made a ${method} request to ${url}`);
  }
  else{
    
    const requestedPath = url === '/' ? '/index.html' : url;
    
    
    
    await fs.readFile('html' + requestedPath, function (err, data){
      if(err == null) {
        response.writeHead(200, {"content-type": `text/html`});
        response.write(data);
        response.end();
      }
    });
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

async function resolveRequest(requestURL){
  if(requestURL.length != 6){
    return '';
  }
  try {
  	const result = await client.query(`SELECT * from ${process.env.DATABASETABLENAME} where shorturl = '` + requestURL.replace('/', '') +"';");
  	return 'https://' + result.rows[0]['longurl'];
  }
  catch (err) {
    console.log('DB error: ' + err)
    console.log('URL doesnt exit or db error')
    
  }

  return '';
}
