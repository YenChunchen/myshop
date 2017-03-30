var connectdb=require('../connectdb');
var url = require('url');
var fs = require('fs');

module.exports=function (id){   //刪除會員圖檔
  return new Promise(function(resolve,reject){
    var selstr="SELECT * FROM membertable WHERE id="+id;
    var delstr="DELETE  FROM membertable WHERE id="+id;
    connectdb.query(selstr,function(err,rows){
      if(err){
        reject(err);
      }
      if(rows.length===0) {
        var nonexist="該會員不存在";
        resolve(nonexist);
      }
      else{
        fs.unlink('./pic/member/'+rows[0].new_pic_name);
        connectdb.query(delstr, function(err) {
          if (err) {
            reject(err);
          }
          else {
            var success="會員刪除成功";
            resolve(success);
          }
        });
      }
    });
  });
 };
