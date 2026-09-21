const http = require('http');
const fs = require('fs/promises'); // Use promises version of fs
const pg = require('pg');

const client = new pg.Client({
  user: process.env.DATABASEUSER,
  password: process.env.DATABASEPASSWORD,
  host: process.env.DATABASEHOST,
  port: process.env.DATABASEPORT,
  database: process.env.DATABASENAME,
});

//Catch connection errors so the app doesn't silently fail
client.connect().catch(err => console.error("Database connection error:", err));

const server = http.createServer(async (request, response) => {
  const { url, method } = request;
  let redirectURL = '';

  try {
    redirectURL = await resolveWebRequest(url);
  } catch (err) {
    console.error("Error resolving request:", err);
  }

  const shouldRedirect = Boolean(redirectURL);

  if (shouldRedirect) {
    // 308 Permanent Redirect (or 302 for temporary)
    response.writeHead(308, { 'Content-Type': 'text/plain', 'Location': redirectURL });
    response.end(`Redirecting to ${redirectURL}`);
  } else {
    const requestedPath = url === '/' ? '/index.html' : url;
    const filePath = 'html' + requestedPath;
    
    try {
      // Replaced the broken callback with a proper await
      const data = await fs.readFile(filePath);
      
      // Determine content type (basic check for css/js/html)
      let contentType = 'text/html';
      if (filePath.endsWith('.css')) contentType = 'text/css';
      if (filePath.endsWith('.js')) contentType = 'application/javascript';

      response.writeHead(200, { "Content-Type": contentType });
      response.end(data);
    } catch (err) {
      // FIX: Close the connection if the file is missing so the browser doesn't hang
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("404 - Not Found");
    }
  }
});

const API = http.createServer(async (request, response) => {
  const { url, method } = request;
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ status: "ok" }));
  
});

server.listen(8080, () => {
  console.log('Web Server running at http://127.0.0.1:8080/');
});

API.listen(3000, () => {
  console.log('API server running at http://127.0.0.1:3000/');
});


async function resolveWebRequest(requestURL) {
  // URLs usually come in as "/abcde"
  const shortCode = requestURL.replace('/', '');
  console.log("Short code:", shortCode);
  console.log("Request URL:", requestURL);
  
  if (shortCode.length !== 5) {
    return '';
  }

  try {
   
    const queryText = `SELECT * from links where shorturl = $1;`;
    const result = await client.query(queryText, [shortCode]);
    
    // CRITICAL FIX: Check if the row actually exists before trying to read it
    if (result.rows.length > 0) {
      return 'https://' + result.rows[0]['longurl'];
    }
    
    return ''; // Return empty string if no matching URL is found in the DB
  } catch (err) {
    console.error('DB error: ', err);
    return '';
  }
}

// async function resolveAPIRequest(requestURL) {

//   console.log("Request URL:", requestURL);
  
//   if(shortCode == "api") {
//     return 'api'
//   }
//   if (shortCode.length !== 5) {

//     return '';

//   }



//   try {

   

//     const queryText = `SELECT * from links where shorturl = $1;`;

//     const result = await client.query(queryText, [shortCode]);

    

//     // CRITICAL FIX: Check if the row actually exists before trying to read it

//     if (result.rows.length > 0) {

//       return 'https://' + result.rows[0]['longurl'];

//     }

    

//     return ''; // Return empty string if no matching URL is found in the DB

//   } catch (err) {

//     console.error('DB error: ', err);

//     return '';

//   }

// }
