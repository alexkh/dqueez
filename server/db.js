import dotenv from 'dotenv'
dotenv.config()
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

import pg_pkg from 'pg';
const { Pool } = pg_pkg;
const pool = new Pool({
	user: DB_USER,
	host: 'localhost',
	database: DB_USER,
	password: DB_PASS,
	port: 5432
})

pool.on('error', (err) => {
	console.error('An idle client has experienced an error', err.stack)
})

export async function new_quiz(data) {
    const added_quiz = await
        pool.query(`insert into quiz (qurl, qjson, qpasswd) values
        ($1, $2, $3) returning *`, [
            data.qurl,
            data.qjson,
            data.qpasswd
        ]);
    return added_quiz.rows;
}

export async function fetch_quiz(qurl) {
    const quiz = await pool.query(`select * from quiz where qurl = $1`,
        [qurl]);
    return quiz.rows;
}

