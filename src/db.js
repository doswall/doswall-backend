import 'dotenv/config';
import mysql from 'mysql2';

// 1) Setup MySQL

// const db = mysql.createConnection({
//    user: process.env.DB_USER,
//    host: process.env.DB_HOST,
//    database: process.env.DB_DATABASE,
//    password: process.env.DB_PASSWORD,

//    // disable this if you're not using a custom port or deploying on server
//    port: process.env.DB_PORT
// });


const db = mysql.createConnection({
   user: "sigmaski_sigmamale",
   host: "sigmaskibidi.my.id",   //doegus.sigma...
   database: "sigmaski_dogoes",
   password: "SIGMASIGMABOYSIGMABOY",

   // disable this if you're not using a custom port or deploying on server
   // port: process.env.DB_PORT
});




// 3) Connect to DB and Error Handling
db.connect((err) => {
   if (err) {
      console.error('Error connecting to MySQL database:', err);
      process.exit(-1);
   }
   console.log('Connected to MySQL database');
});

db.on('error', (err) => {
   console.error('MySQL database error:', err);
   process.exit(-1);
});



// 4) Addons Functions
export const query = (text, params) => {
   return new Promise((resolve, reject) => {
      db.query(text, params, (err, results) => {
         if (err) return reject(err);
         resolve(results);
      });
   });
};
