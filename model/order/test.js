var connectdb=require('../connectdb');  //connect to db module
var async=require('async');
var temparr={};
exports.create_cart=function(temparr,item_ids,orderguy_id){
  return new Promise(function(resolve,reject){
    async.waterfall([
      check_member,  //商務邏輯檢查(會員)
      cart_isexist,  //商務邏輯檢查(cart)
      get_correct_dbinfo,   //商務邏輯檢查(庫存及商品存在)
      get_match_data,  //整理符合資料
      count_total,   //運算,資料整合
    ],/*將最終合法購物車資料存入資料庫*/ function (err,result) {
      connectdb.query('INSERT INTO cart SET ?',result,function(err){
        if(err)
          reject(err);
        else{
          var success='商品已加入購物車';
          resolve(success);
        }
      });
    });
    //檢查會員是否存在
    function check_member(callback){
      connectdb.query('SELECT * FROM membertable WHERE id=?',orderguy_id,function(err,rows){
        console.log(rows.length);
        if(rows.length===1){
          callback(null);
        }else{ //如果不是會員
          var nonexist="請登入會員";
          reject(nonexist);
          return;
        }
      });
    }
    //檢查會員購物車是否存在
    function cart_isexist(callback){
      connectdb.query('SELECT * FROM cart WHERE orderguy_id=?',orderguy_id,function(err,rows){
        console.log(rows.length);
        if(rows.length===0){  //如果還沒有購物車
          callback(null);
        }else{
          var isexist="該購物車已存在";
          reject(isexist);
          return;
        }
      });
    }

    //初步取得DB商品資訊,檢查id存在及庫存
    function get_correct_dbinfo(callback) {
      var selstr='select * from products where id in('+item_ids+')';
      connectdb.query(selstr,function(err,rows){
        var failarr=[];
        for(var i=0;i<=temparr.length-1;i++){
          for(var j=0;j<=rows.length-1;j++){
            if(temparr[i].id===(rows[j].id).toString()){
              break;
            }
            if(j===rows.length-1){
              failarr.push('id:'+temparr[i].id+'不存在');
            }
          }
        }
        for(var x=0;x<=temparr.length-1;x++){
          for(var y=0;y<=rows.length-1;y++){
            if(parseInt(temparr[x].quan)-rows[y].store<0){
              break;
            }
            if(y===rows.length-1){
              failarr.push('id:'+temparr[x].id+'庫存不足');
            }
          }
        }
        if(failarr.length>0){
          reject(failarr);
        }else{
          callback(null,rows);  //如資料皆正確
        }
      });
    }
    /*依本次購買資訊和DB商品資料匹配找出符合資訊*/
    function get_match_data(rows,callback) {
      var ids=[],price=[],store=[];
      for(var i in rows){   //將有正確id商品資訊放入對應陣列
        ids.push(rows[i].id);
        price.push(rows[i].price);
        store.push(rows[i].store);
      }
      var correct_info=[];  //存放DB商品資料和本次購買匹配資訊
      for(var x=0;x<=ids.length-1;x++){//依本次購買資訊和DB商品資料匹配找出符合資訊
        for(var y=0;y<=temparr.length-1;y++){
          if((ids[x].toString()===temparr[y].id)&&(store[x]>=temparr[y].quan)){
          //如id符合及庫存足購則計算總合
            temparr[y].price=price[x];
            correct_info.push(temparr[y]);
          }
        }
      }
      callback(null,correct_info);
    }
    //計算總合
    function count_total(correct_info,callback) {
      console.log(correct_info);
      var total=0;
      var products_id='';  //存放所有合法商品id字串
      var products_quentity='';  //存放所有合法商品數量字串
      for(var i in correct_info){
        total+=correct_info[i].quan*correct_info[i].price; //計算商品價格總合
        if(parseInt(i)!==correct_info.length-1){    //products_id,products_quentity字串組合
          products_id+=correct_info[i].id+',';
          products_quentity+=correct_info[i].quan+',';
        }else{
          products_id+=correct_info[i].id;
          products_quentity+=correct_info[i].quan;
        }
      }
      var insert_obj={};  //存放最終處理結果
      insert_obj.products_id=products_id;
      insert_obj.products_quentity=products_quentity;
      insert_obj.total=total;
      insert_obj.orderguy_id=orderguy_id;
      callback(null,insert_obj);
    }
  });
};
