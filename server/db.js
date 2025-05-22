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

export async function get_item(slug) {
	return pool.query('select * from merchandise where slug = $1, [slug]')
}

export async function get_all_tags() {
	return pool.query('select * from tag_name');
}