var connectdb=require('../connectdb');
module.exports=function (sqlcmd) {     //顯示全部資料function
  return new Promise(function(resolve,reject){
    connectdb.query(sqlcmd, function(err, rows) {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};
