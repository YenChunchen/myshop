var connectdb=require('../connectdb');  //connect to db module
var async=require('async');
var total=0;
exports.create_cart=function(p_id,q,max,current,failarr,item_ids,item_nums,orderguy_id){
  //p_id:本次購買該商品項,q:本次購買該商品數,max:最大選購項目,current：迴圈值行次數,failarr錯誤存放,item_ids本次商品,item_nums本次數量,orderguy_id購買人
  sqlstr='SELECT price,store FROM products WHERE id='+p_id;
  return new Promise(function(resolve,reject){
    async.waterfall([
        check_store,
    ],/*將最終合法購物車資料存入資料庫*/ function (err, result) {
      if(current===max){
        total=0;   //每次計算訂單總合完歸0 ,否則下次會累加
        if(failarr.length===0){
          var temp={  //把合法的資料放在temp資料結構中
            products_id:item_ids,
            products_quentity:item_nums,
            total:result,
            orderguy_id:orderguy_id
          };
          connectdb.query('INSERT INTO cart SET ?',temp,function(err){//把最終的資料更動到 DB
             if(err){
               var isexist='購物車已存在';
               resolve(isexist);
             }
             else{
               connectdb.commit();
               var success='商品已加入購物車';
               resolve(success);
             }
          });
        }
        if(failarr.length>0){
          var fail={
            fail:failarr
          };
          resolve(fail);
        }
      }
    });
    /*檢查是否有該品項,庫存,並計算購物車金額*/
    function check_store(callback) {  //檢查商業規則、商業資料計算整理
      if(current===1){
        connectdb.beginTransaction();
      }
      connectdb.query(sqlstr,function(err,rows){
        if(rows[0]===undefined){
          failarr.push('id:'+p_id+'品項不存在');
          callback(null,null,null);
        }
        else{
          if(q>rows[0].store){
            failarr.push('id:'+p_id+'庫存不足');
            callback(null,null,null);
          }
          else{
            total=total+q*rows[0].price;
            callback(null, total);
          }
        }
      });
    }
  });
};

exports.check_cartfields=function(item_ids,item_nums){
  console.log(item_ids,item_nums);
  return new Promise(function(resolve,reject){
    if((item_ids===undefined)||(item_nums===undefined)||(item_ids==='')||(item_nums==='')){
      var field_fail='請輸入正確欄位';
      resolve(field_fail);
      return;
    }else{
      var ids_arr=item_ids.split(',');
      var nums_arr=item_nums.split(',');
      if(ids_arr.length!==nums_arr.length) { //檢查欄位數量相同？
        var num_fail='請輸入對應數量';
        resolve(num_fail);
        return;
      }else{
        resolve('true');
      }
    }
  });
};
