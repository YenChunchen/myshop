var connectdb=require('../connectdb');
var async=require('async');
var sendmail=require('./sendmail');

module.exports=function(orderid){
  return new Promise(function(resolve,reject){
    async.waterfall([
      check_thisorderlist_isexist,
      delete_thisorderlist,
      //刪除該筆訂單對應購物車
    ],function(err,id){
      var delstr='delete from cart where id='+id.toString();
      connectdb.query(delstr,function(err){
        if(err){
          connectdb.rollback();
          reject(err);
        }
        else{
          var success='刪除成功';
          connectdb.commit();
          resolve(success);
        }
      });
    });
    //查看該訂單是否存在
    function check_thisorderlist_isexist(callback){
      var selectstr='select * from orderlist where id='+orderid;
      connectdb.query(selectstr,function(err,rows){
        if(rows[0]===undefined){
          var nonexist='無該筆訂單';
          resolve(nonexist);
          return;
        }
        if(rows[0].ispay===1){
          var ispay='訂單已付款,無法刪除';
          resolve(ispay);
          return;
        }
        else{
          callback(null,rows[0].cart_id);
        }
      });
    }
    //刪除該筆訂單
    function delete_thisorderlist(id,callback){
        var cartid=id;
        connectdb.beginTransaction();
        var deletestr='delete  from orderlist where id='+orderid;
        connectdb.query(deletestr,function(err){
          if(err){
            connectdb.rollback();
            reject(err);
          }
          else{
            console.log(cartid);
            callback(null,cartid);
          }
        });
    }
  });
};
