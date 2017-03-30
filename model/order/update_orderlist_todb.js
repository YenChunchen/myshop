var express = require('express');
var router = express.Router();
var connectdb=require('../connectdb');
var async=require('async');
var sendmail=require('./sendmail');

exports.get_updateinfo=function(id){
  var str='SELECT * FROM orderlist A1, cart A2 WHERE A1.cart_id = A2.id and A1.id='+id ;
  return new Promise(function(resolve,reject){
    connectdb.query(str,function(err,rows){
        if(err)
          reject(err);
        else
          resolve(rows);
    });
  });
};

exports.edit_orderlist=function(orderid,temp){
  return new Promise(function(resolve,reject){
    async.waterfall([
      check_thisorderlist_isexist,
      check_email_ischanged,
      get_thisorderlist_cartinfo,
      recount_thisorderlist_total,
    ],function(err,newcart,thisorder,thisupdate){
      var updatestr='UPDATE cart SET ? WHERE id='+(thisorder.cart_id).toString();
      connectdb.query(updatestr,newcart,function(err){
        if (err) {
          reject(err);
        }
        else {
          sendmail.sendmail(thisorder,newcart[0]);  //傳入當前訂單,購物車
          var success='訂單修改成功';
          resolve(success);
        }
      });
    });

    //判斷是否有該筆訂單
    function check_thisorderlist_isexist(callback){
      var selectstr='select * from orderlist where id='+orderid;
      connectdb.query(selectstr,function(err,rows){
        if(rows[0]===undefined){
          var noexist='無該筆訂單';
          resolve(noexist);
          return;
        }
        if(rows[0].ispay===1){
          var ispay='訂單已付款,無法修改';
          resolve(ispay);
          return;
        }
        else{  //如訂單存在傳送該訂單更改內容
            callback(null,rows[0],temp);
        }
      });
    }
    /*判斷本次更新是否變更email*/
    function check_email_ischanged(thisorder,thisupdate,callback){
      if((thisupdate.email===undefined)||(thisupdate.email==='')){
        callback(null);
      }
      else{
        var updatestr='update orderlist set email='+"'"+thisupdate.email+"'"+' where id='+thisorder.id.toString();
        connectdb.query(updatestr,function(err){
          callback(null,thisorder,thisupdate);  //thisorder該筆訂單內容,thisupdate本次更新內容
        });
      }
    }

    /*挑出該筆訂單購物車資訊*/
    function get_thisorderlist_cartinfo(thisorder,thisupdate,callback){
      var selstr='select * from cart where id ='+thisorder.cart_id.toString();
      connectdb.query(selstr,function(err,oldcart){
        callback(null,oldcart,thisorder,thisupdate);
      });
    }

    /*重新計算訂單總價*/
    function recount_thisorderlist_total(oldcart,thisorder,thisupdate,callback){
      oldcart[0].products_id=thisupdate.products_id;
      oldcart[0].products_quentity=thisupdate.products_quentity;
      var arr_id=thisupdate.products_id.split(',');
      var arr_q=thisupdate.products_quentity.split(',');
      var total=0,current=0;
      for(var i in arr_id){
        current++;
        var selstr='SELECT * FROM products WHERE id='+arr_id[i];
        accounttotal(arr_id[i],arr_q[i],selstr,current,arr_id.length);
      }
      function accounttotal(id,q,selstr,current,max){
        /*id：該次購買產品id,q:該次購買產品數量,selstr:SQL選取該次產品字串,current：目前計算到第幾個產品,max：總夠買產品種類*/
        connectdb.query(selstr,function(err,rows){
          if(rows[0]===undefined){
            var noexist='id:'+id+'品項不存在';
            resolve(noexist);
            connectdb.rollback();
            return;
          }
          if(current===1){
            connectdb.beginTransaction();
          }
          if(rows[0].store-q<0){
            var nostore='id:'+id+'庫存不足';
            resolve(nostore);
            connectdb.rollback();
            return;
          }
          else{
            total=total+q*rows[0].price;
          }
          if(current===max){
            connectdb.commit();
            oldcart[0].total=total;
            callback(null,oldcart,thisorder,thisupdate);
          }
        });
      }
    }
  });
};
