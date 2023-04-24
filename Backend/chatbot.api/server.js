import app from './src/app.js'

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`)
})


/*
const http = require('http');
const host = 'localhost';
const port = 8000;
const requestListener = function (req, res) {
    console.log('request received');
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end('<h1>This is Ngrok</h1>');
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
});
*/