var connectdb=require('../connectdb');
var base64str=require('./base64_encode_item');
var fs = require("fs");
exports.get_oneitem=function (id) {     //顯示全部資料function
  return new Promise(function(resolve,reject){
    var selectstr="SELECT * FROM products WHERE id="+id;
    connectdb.query(selectstr, function(err, rows) {
      if (err) {
        reject(err);
      }
      else
        resolve(rows);
    });
  });
};

exports.edititem=function (temp,file,id) {  //更新function
  return new Promise(function(resolve,reject){
    if((temp.name==='')||(temp.name===undefined)) {
      fs.unlink('pic/products/'+file.filename);
      var name_fail='請輸入商品名稱';
      resolve(name_fail);
      return;
    }
    if((temp.price==='')||(temp.price===undefined))  {
      fs.unlink('pic/products/'+file.filename);
      var price_fail='請輸入商品價格';
      resolve(price_fail);
      return;
    }
    if((temp.store==='')||(temp.store===undefined))  {
      fs.unlink('pic/products/'+file.filename);
      var store_fail='請輸入商品存量';
      resolve(store_fail);
      return;
     }
    var  imgtodb={
      name:temp.name,
      price:parseFloat(temp.price),
      store:parseInt(temp.store),
      old_pic_name:'',
      photo:'',
      new_pic_name:'',
    };
    if (file===undefined) {
      var file_fail='未上傳檔案或檔案格式錯誤(jpg png)';
      resolve(file_fail);
      return;
    }
    else  {
      imgtodb.old_pic_name=file.originalname;
      imgtodb.new_pic_name=file.filename;
    }
    imgtodb.photo=base64str.base64_encode(file.filename); //將base64str加入imgtodb
    var selectstr='SELECT * FROM products WHERE id='+id;
    var updatestr='UPDATE products SET ? WHERE id='+id;
    connectdb.query(selectstr,function(err,rows){
      if(err)
        reject(err);
      if(rows.length===0){
        fs.unlink('./pic/products/'+file.filename);
        var nonexist='無該項商品';
        resolve(nonexist);
      }
      else{
        fs.unlink('./pic/products/'+rows[0].new_pic_name);  //移除前次圖檔
        connectdb.query(updatestr,imgtodb,function(err,rows){
          if(err)
            reject(err);
          else{
            var success='更新成功';
            resolve(success);
          }
        });
      }
    });
  });
};
