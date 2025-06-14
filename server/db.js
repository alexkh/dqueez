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

// create new quiz
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

// modify existing quiz
export async function q_modify(data) {
    const modified_quiz = await
        pool.query(`update quiz set qjson=$1, qupdated=now() where qurl=$2
            returning *`, [
            data.qjson,
            data.qurl
        ]);
    return modified_quiz.rows;
}

// get only just the quiz given quiz url qurl
export async function fetch_quiz(qurl) {
    const quiz = await pool.query(`select * from quiz where qurl = $1`,
        [qurl]);
    return quiz.rows;
}

// create new exam
export async function e_create(data) {
    const added_exam = await
        pool.query(`insert into exam (eqid, eurl,
            etime_limit_seconds) values ($1, $2, $3) returning *`, [
            data.qid, data.eurl,
            data.etime_limit_seconds
        ]);
    return added_exam.rows;
}

// modify an existing exam
export async function e_modify(data) {
    const modified_exam = await
        pool.query(`update exam set estart = $1, efinish = $2,
            etime_limit_seconds = $3
            where eqid = $4 and eurl = $5
            returning *`, [
            data.estart, data.efinish,
            data.etime_limit_seconds,
            data.qid, data.eurl,
        ]);
    return modified_exam.rows;
}

// for a given quiz, fetch all the exams
export async function fetch_exams(qid) {
    const exams = await
        pool.query(`select eid, eurl,
            estart at time zone etz at time zone 'UTC' as estart,
            efinish at time zone etz at time zone 'UTC' as efinish,
            etime_limit_seconds
            from exam
            where eqid = $1 order by eid desc`,
        [qid]);
    return exams.rows;
}

export async function fetch_inputs_min(qid) {
    const inputs = await
        pool.query(`select iid, ieid, iurl, istudent_id from input
            inner join exam on ieid = eid where eqid = $1
            order by ieid, iid desc`,
        [qid]);
    return inputs.rows;
}

