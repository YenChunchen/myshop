var connectdb=require('../connectdb');  //connect to db module
var async=require('async');
exports.create_cart=async function(cart_info,item_ids){
    try{
      await check_member(cart_info.orderguy_id);
      await cart_isexist(cart_info.orderguy_id);
      var correct_products_info=await  get_correct_dbinfo(cart_info.cart_content,item_ids); //正確product資訊(無price)
      var correct_cart_info=await get_match_data(cart_info.cart_content,correct_products_info); //合法cart資訊
      var final_data=await count_total(correct_cart_info,cart_info.orderguy_id);
      await add_newcart(final_data);
      return('商品已加入購物車');
    }
    catch(err){
      console.log(err);
      if(typeof err==='object'){
        return err.join(",");
      }else{
        return err.message;
      }
    }
};



//檢查會員是否存在
function check_member(orderguy_id){
  return new Promise(function(resolve,reject){
    connectdb.query('SELECT * FROM membertable WHERE id=?',orderguy_id,function(err,rows){
      if(err){
        reject(err);
        return;
      }
      if(rows.length===1){
        resolve();
      }else{ //如果不是會員
        reject("請登入會員");
        return;
      }
    });
  });
}
//檢查會員購物車是否存在
function cart_isexist(orderguy_id){
  return new Promise(function(resolve,reject){
    connectdb.query('SELECT * FROM cart WHERE orderguy_id=?',orderguy_id,function(err,rows){
      if(err){
        reject(err);
        return;
      }
      if(rows.length===0){  //如果還沒有購物車
        resolve();
      }else{
        reject("該購物車已存在");
        return;
      }
    });
  });
}

//初步取得DB商品資訊,檢查id存在及庫存
function get_correct_dbinfo(cart_content,item_ids) {
  var selstr='select * from products where id in('+item_ids+')';
  return new Promise(function(resolve,reject){
    connectdb.query(selstr,function(err,rows){
      var failarr=[];
      for(var i=0;i<=cart_content.length-1;i++){
        for(var j=0;j<=rows.length-1;j++){
          if(cart_content[i].id===(rows[j].id).toString()){
            break;
          }
          if(j===rows.length-1){
            failarr.push('id:'+cart_content[i].id+'不存在');
          }
        }
      }
      for(var x=0;x<=cart_content.length-1;x++){
        for(var y=0;y<=rows.length-1;y++){
          if(parseInt(cart_content[x].quan)-rows[y].store<0){
            break;
          }
          if(y===rows.length-1){
            failarr.push('id:'+cart_content[x].id+'庫存不足');
          }
        }
      }
      if(failarr.length>0){
        reject(failarr);
      }else{
        resolve(rows);  //如資料皆正確
      }
    });
  });
}
//依本次購買資訊和DB商品資料匹配找出符合資訊
function get_match_data(cart_content,correct_products_info){
  return new Promise(function(resolve,reject){
    var ids=[],price=[],store=[];
    for(var i in correct_products_info){   //將有正確id商品資訊放入對應陣列
      ids.push(correct_products_info[i].id);
      price.push(correct_products_info[i].price);
      store.push(correct_products_info[i].store);
    }
    var correct_info=[];  //存放DB商品資料和本次購買匹配資訊
    for(var x=0;x<=ids.length-1;x++){//依本次購買資訊和DB商品資料匹配找出符合資訊
      for(var y=0;y<=cart_content.length-1;y++){
        if((ids[x].toString()===cart_content[y].id)&&(store[x]>=cart_content[y].quan)){
        //如id符合及庫存足購則計算總合
          cart_content[y].price=price[x];
          correct_info.push(cart_content[y]);
        }
      }
    }
    resolve(correct_info);
  });
}
//計算總合
function count_total(correct_info,orderguy_id) {
  return new Promise(function(resolve,reject){
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
    resolve(insert_obj);
  });
}
//建立新購物車
function add_newcart(final_data){
  return new Promise(function(resolve,reject){
    connectdb.query('INSERT INTO cart SET ?',final_data,function(err){
      if(err){
        reject(err);
        return;
      }
      else{
        resolve();
      }
    });
  });
}
