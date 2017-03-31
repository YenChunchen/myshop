var connectdb=require('../connectdb');  //connect to db module
var async=require('async');
var temparr={};
exports.create_cart=function(orderguy_id,item_ids,item_nums){
  return new Promise(function(resolve,reject){


  });
};



exports.check_cartfields=function(orderguy_id,item_ids,item_nums){
  return new Promise(function(resolve,reject){
    if((item_ids===undefined)||(item_nums===undefined)||(item_ids==='')||(item_nums==='')||(isNaN(orderguy_id))){
      reject('請輸入正確欄位');   //檢查欄位
    }else{
      var ids_arr=item_ids.split(',');
      var nums_arr=item_nums.split(',');
      if(ids_arr.length!==nums_arr.length) { //檢查欄位數量相同？
        reject('請輸入對應數量');
      }else{
          var all_id=item_ids.split(',');   //將符合條件系統參數整理成物件陣列
          var all_quan=item_nums.split(',');
          var temparr=[];
          for(var i=0;i<=all_id.length-1;i++){
            var temp={
              id:all_id[i],
              quan:all_quan[i]
            };
            temparr.push(temp);
          }
          resolve(temparr);
      }
    }
  });
};
