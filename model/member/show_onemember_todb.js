var connectdb=require('../connectdb');

module.exports=function (id) {
  return  new Promise(function(resolve,reject){
    var selstr="SELECT id,account,pwd  FROM membertable WHERE id="+id;
    connectdb.query(selstr, function(err, rows){
      if(err){
        reject(err);
      }
      resolve(rows);
    });
  });
};
