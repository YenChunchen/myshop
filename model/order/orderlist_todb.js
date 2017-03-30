var connectdb=require('../connectdb');
var async=require('async');
var sendmail=require('./sendmail');

var today=new Date();
var orderTime={
  year:today.getFullYear(),
  month:today.getMonth()+1,
  date:today.getDate()
};
exports.get_orderlist_info=function(){
  var str='SELECT A1.id,A1.email,A1.orderdate,A1.ispay,A2.products_id,A2.products_quentity,A2.total,A3.account  '+
  'FROM orderlist A1, cart A2 ,membertable A3 '+
  'WHERE A1.cart_id = A2.id and A1.orderguy_id=A3.id' ;
  return new Promise(function(resolve,reject){
    connectdb.query(str,function(err,rows){
      if(err)
        reject(err);
      else
        resolve(rows);
    });
  });
};


exports.create_orderlist=function(email,ispay,orderguyid){
  return new Promise(function(resolve,reject){
    if((email==='')||(email===undefined)){
      var email_fail='請輸入email';
      resolve(email_fail);
    }
    if((ispay==='')||(ispay===undefined)){
      var ispay_fail='付款狀態錯誤';
      resolve(ispay_fail);
    }
    var temp={
      email:email,
      orderdate:orderTime.year+'/'+orderTime.month+'/'+orderTime.date,
      ispay:ispay,
      orderguy_id:orderguyid,
    };
    var selstr='SELECT * FROM cart where orderguy_id='+temp.orderguy_id;
    async.waterfall([
      check_thismember_cart,
      find_thiscart_id,
      check_thisorderlist_isexist,
      /*判斷該訂單是否已存在,不在則添加訂單*/
    ],function(err,thisorderlist,thiscart){ //result:該筆訂單,findcart:該訂單購物車內容
      connectdb.query('INSERT INTO orderlist SET ?',thisorderlist,function(err,rows){
        if(err){
         reject(err);
        }
        else{
          sendmail.sendmail(thisorderlist,thiscart);
          var success='訂單成立';
          resolve(success);
        }
      });
    });
    /*找購物車資料表中有無該用戶的購物車*/
    function check_thismember_cart(callback){
      var findcart;
      connectdb.query(selstr,function(err,rows){
        if(rows.length===0){
          var nomembercart='該會員暫無購物車';
          resolve(nomembercart);
          return;
        }
        else{
          findcart=rows[0];
          callback(null,findcart);
        }
      });
    }
    /*找到將該購物車id加至temp*/
    function find_thiscart_id(findcart,callback){
      temp.cart_id=findcart.id;
      callback(null,temp,findcart);
    }
    /*判斷該訂單是否已存在*/
    function check_thisorderlist_isexist(temp,findcart,callback){
      var selorderlist='SELECT * FROM orderlist WHERE cart_id='+temp.cart_id.toString();
      connectdb.query(selorderlist,function(err,rows){
        console.log(rows[0]);
        if(rows[0]===undefined){
          callback(null,temp,findcart);
        }
        else{
          var orderexist='該會員訂單已存在';
          resolve(orderexist);
          return;
        }
      });
    }
  });
};
