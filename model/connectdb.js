var mysql = new require("mysql");
var config=new require("./db_config");
var mydb  = mysql.createConnection({
    // host: "127.0.0.1",
    // user: "root",
    // password: "1",
    // database: "myfirstdb"
    host: config.host,
    user:  config.user,
    password:  config.password,
    database:  config.database
});
module.exports = mydb;
