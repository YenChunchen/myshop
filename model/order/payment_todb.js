var connectdb=require('../connectdb');
var async=require('async');


exports.pay=function(orderid){
  return new Promise(function(resolve,reject){
    async.waterfall([
      check_thisorderlist_ispay,
      get_thisorderlist_content,
      check_store,
      less_store,
    ],/*更新訂單*/function(err,failarr,thisorder){
      var updatestr='UPDATE orderlist SET ispay=1 WHERE id='+(thisorder.id).toString();
      if(failarr.length!==0){
        connectdb.rollback();
        resolve(failarr);
        return;
      }
      else{
        connectdb.query(updatestr,function(err){
          if (err) {
            reject(err);
          }
          else {
            connectdb.commit();
            var success='付款完成';
            resolve(success);
          }
        });
      }
    });
    //檢查有無該訂單及是否付款
    function check_thisorderlist_ispay(callback){
      connectdb.beginTransaction();
      var selectstr='select * from orderlist where id='+orderid;
      connectdb.query(selectstr,function(err,rows){
        if(rows[0]===undefined){
          var noexist='無該筆訂單';
          resolve(noexist);
          return;
        }
        if(rows[0].ispay===1){
          var ispay='訂單已付款';
          resolve(ispay);
          return;
        }
        else{
            callback(null,rows[0]);
        }
      });
    }
    //選出該訂單的購物車產品 數量
    function get_thisorderlist_content(thisorder,callback){
      var selstr='select * from cart where id='+(thisorder.cart_id).toString();
      connectdb.query(selstr,function(err,rows){
        callback(null,rows[0].products_id,rows[0].products_quentity,thisorder);
      });
    }
    //檢查是否庫存足購
    function check_store(ids,quentitys,thisorder,callback){
      var ids_arr=ids.split(',');
      var quentitys_arr =quentitys.split(',');
      var current=1,failarr=[];
      for(var i =0;i<=ids_arr.length-1;i++){
        checkquentitys(ids_arr[i],parseInt(quentitys_arr[i]),ids_arr.length,current,failarr,thisorder);
        current++;
      }
      function checkquentitys(id,q,max,current,failarr,thisorder){
        var selstr='select * from products where id='+id.toString();
        connectdb.query(selstr,function(err,rows){
          if(q>rows[0].store){
            failarr.push('id:'+rows[0].id+'庫存不足');
          }
          if(current===max){
            callback(null,failarr,ids_arr,quentitys_arr,thisorder);
          }
        });
      }
    }
    //庫存足購則依序減庫存
    function less_store(failarr,ids_arr,quentitys_arr,thisorder,callback){
      if(failarr.length!==0){
        callback(null,failarr,thisorder);
      }
      else{
        var current=1;
        for(var i =0;i<=ids_arr.length-1;i++){
          updatestore(ids_arr[i],parseInt(quentitys_arr[i]),ids_arr.length,current,thisorder);
          current++;
        }
      }
      function updatestore(id,q,max,current,thisorder){
        var selstr='select * from products where id='+id.toString();
        connectdb.query(selstr,function(err,rows){
          var updatestr='update products set store='+(rows[0].store-q).toString()+' where id='+rows[0].id;
          connectdb.query(updatestr,function(err,rows){
            if(current===max){
                callback(null,failarr,thisorder);
            }
          });
        });
      }
    }
  });
};
