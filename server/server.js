'use strict';

const port = 3232;

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as db from './db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

// default handler of a database error: log it on server side and send 500 resp
function err_db(err, res) {
	res.status(500).json({ err: 'db error' })
	console.log(err)
}

// custom base-64 encoding where / is replaced by _ and + by - and = removed
function urlsafe64(base64) {
	return base64.replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '')
}

// access to each quiz requires a matching password
async function check_password(qurl, password) {
    const rows = await db.fetch_quiz(qurl);
    if(rows.length !== 1) {
        throw new Error('Invalid qurl or password');
    }
    const password_good = await bcrypt.compare(password, rows[0].qpasswd);
    if(!password_good) {
        throw new Error('Invalid qurl or password');
    }
    return rows[0];
}

// serve the new_page.html file when the user goes to /new_exam
app.get('/new_exam', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/new_exam.html'));
});

app.get('/q/:qurl', (req, res) => {
    res.sendFile(__dirname + '/public/edit.html');
});

// create new quiz and add it to the database, return url and password
app.post('/api/new', async (req, res) => {
    try {
        // generate random password for the quiz
        const password = urlsafe64(crypto.randomBytes(6).toString('base64'));
        const data = {
            // generate random url for the quiz
            qurl: urlsafe64(crypto.randomBytes(6).toString('base64')),
            // store in the database the hashed password
            qpasswd: await bcrypt.hash(password, 10),
            // the quiz json comes from the request body
            qjson: req.body
        };
        const rows = await db.new_quiz(data);
        console.log(rows);
        res.status(200).json({ qurl: data.qurl, password });
    } catch(err) { err_db(err, res) }
});

// save modifications to an existing quiz in the database
app.post('/api/q/modify', async (req, res) => {
    try {
        console.log('modifying an existing quiz:',
            req.headers.referer.split('/').pop());
        const qurl = req.headers.referer.split('/').pop();
        console.log('qurl = ', qurl);
        const rows = await db.fetch_quiz(qurl);
        if(rows.length !== 1) {
            throw new Error('Invalid qurl or password');
        }
        // check if password matches
        const password_good = await bcrypt.compare(req.body.password,
            rows[0].qpasswd);
        if(!password_good) {
            throw new Error('Invalid qurl or password');
        }
        // password matches, proceed to updating the quiz table:
        const data = {
            qurl,
            qjson: req.body.qjson
        }
        const rows2 = await db.q_modify(data);

        res.status(200).json({ qurl: qurl });
    } catch(err) { err_db(err, res) }
});

// fetch just the quiz, without any associated exams and inputs
app.post('/api/fetch_quiz', async (req, res) => {
    try {
        console.log('trying to fetch quiz:',
            req.headers.referer.split('/').pop());
        const qurl = req.headers.referer.split('/').pop();
        console.log('qurl = ', qurl);
        const rows = await db.fetch_quiz(qurl);
        if(rows.length !== 1) {
            throw new Error('Invalid qurl or password');
        }
        // check if password matches
        const password_good = await bcrypt.compare(req.body.password,
            rows[0].qpasswd);
        if(!password_good) {
            throw new Error('Invalid qurl or password');
        }
        res.status(200).json({ qjson: rows[0].qjson });
    } catch(err) { err_db(err, res) }
});

function is_valid_studentid(str) {
    if(str.length > 16) {
        return false;
    }
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(str);
}

async function create_inputs(eid, students) {
    for(let i = 0; i < students.length; ++i) {
        if(!is_valid_studentid(students[i])) {
            continue;
        }
        const stud = {
            ieid: eid,
            iurl: urlsafe64(crypto.randomBytes(6).toString('base64')),
            istudent_id: students[i]
        };
        await db.create_input(stud);
    }
}

app.post('/api/e/create', async (req, res) => {
    try {
        const qurl = req.headers.referer.split('/').pop();
        console.log('creating an exam for quiz', qurl);
        // check if password matches
        const quiz = await check_password(qurl, req.body.password);
        const data = {
            qid: quiz.qid,
            eurl: urlsafe64(crypto.randomBytes(6).toString('base64')),
            estart: req.body.estart,
            efinish: req.body.efinish,
            etime_limit_seconds: req.body.etime_limit_seconds
        };
        const rows = await db.e_create(data);
        // add new inputs if any student id's provided
        const students = req.body.estudents.trim().split(/\s+/).filter(Boolean);
        await create_inputs(rows[0].eid, students);

        res.status(200).json({ exam: rows[0] });
    } catch(err) { err_db(err, res) }
});

app.post('/api/e/modify', async (req, res) => {
    try {
        const qurl = req.headers.referer.split('/').pop();
        console.log('modifying an exam for quiz', qurl);
        // check if password matches
        const quiz = await check_password(qurl, req.body.password);
        const data = {
            qid: quiz.qid,
            eurl: req.body.eurl,
            estart: req.body.estart,
            efinish: req.body.efinish,
            etime_limit_seconds: req.body.etime_limit_seconds
        };
        const rows = await db.e_modify(data);
        // add new inputs if any student id's provided
        const students = req.body.estudents.trim().split(/\s+/).filter(Boolean);
        await create_inputs(rows[0].eid, students);

        res.status(200).json({ exam: rows[0] });
    } catch(err) { err_db(err, res) }
});

// fetch exams and the inputs associated with a given quiz
app.post('/api/fetch_exams', async (req, res) => {
    try {
        const qurl = req.headers.referer.split('/').pop();
        console.log('trying to fetch all exams for quiz', qurl);
        // check if password matches
        const quiz = await check_password(qurl, req.body.password);
        const exams = await db.fetch_exams(quiz.qid);
        const inputs = await db.fetch_inputs_min(quiz.qid);

        res.status(200).json({
            qjson: quiz.qjson,
            exams,
            inputs
        });
    } catch(err) { err_db(err, res) }
});

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

