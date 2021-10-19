const express = require('express');
const cors = require('cors');
const router = require('./src/app/routes');

const http = require('http');
const https = require('https');
const app = express();

require("dotenv-safe").config();

app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cors());
app.use(express.json());
app.use(router);

var httpServer = http.createServer(app);

httpServer.listen(5080, () => console.log('Aplicação HTTP rodando na porta 5080'));

// app.listen(5000, () => {
//     console.log('Aplicação rodando na porta 5000');
// });

app.get('/', (request, response) => {
    response.send('Hello world');
});