/**
 * config/db.js
 *
 * MySQL 데이터베이스 연결 설정
 * - mysql2/promise 기반 커넥션 풀 사용
 * - 환경 변수(.env)를 통해 DB 정보 관리
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

/**
 * MySQL Connection Pool
 * - 다중 요청 처리 성능 향상
 * - 연결 재사용을 통해 오버헤드 감소
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;


