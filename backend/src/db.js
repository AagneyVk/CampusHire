import mysql from 'mysql2/promise';
export const pool=mysql.createPool({host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'campushire',password:process.env.DB_PASSWORD||'campushire',database:process.env.DB_NAME||'campushire',waitForConnections:true,connectionLimit:10,queueLimit:0});
