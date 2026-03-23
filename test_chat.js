const http = require('http');
const data = JSON.stringify({messages:[{role:'system',content:'You are a test bot.'},{role:'user',content:'Hello world'}]});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body='';
  res.on('data', chunk=>body+=chunk);
  res.on('end', ()=>{
    console.log('status',res.statusCode);
    console.log('body',body);
  });
});
req.on('error', console.error);
req.write(data);
req.end();
