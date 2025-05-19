'use strict';

const port = 3232;

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/img', express.static(__dirname + '/public/img'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/edit', (req, res) => {
    res.sendFile(__dirname + '/public/edit.html');
});
app.use('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, function() {
    console.log('Listening on port ' + port);
})

