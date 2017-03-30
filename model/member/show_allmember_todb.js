var connectdb=require('../connectdb');
module.exports=function (sqlcmd) {
  return  new Promise(function(resolve,reject){
    connectdb.query(sqlcmd, function(err, rows){
      if(err){
        reject(err);
      }
      resolve(rows);
    });
  });
};
