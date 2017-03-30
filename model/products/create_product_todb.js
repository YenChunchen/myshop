var connectdb=require('../connectdb');
var base64str=require('./base64_encode_item');
var fs = require("fs");
module.exports=function (temp,file){
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
     var  newProduct={
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
        newProduct.old_pic_name=file.originalname;
        newProduct.new_pic_name=file.filename;
      }
      newProduct.photo=base64str.base64_encode(file.filename); //將base64str加入newProduct物件photo欄位
      var selstr="SELECT * FROM products where name="+"'"+temp.name+"'";
      connectdb.query(selstr, function(err, rows) {  //create newaccount
        if(err){
            reject(err);
        }
        if(rows.length!==0)   //判斷帳號是否重複
          {
            fs.unlink('pic/products/'+newProduct.new_pic_name);  //如帳號存在不存圖
            var isexist='該商品已存在,請確認';
            resolve(isexist);
          }
         else{
           connectdb.query("INSERT INTO products SET ?",newProduct);  //沒重複建立
           var success='商品創建成功';
           resolve(success);
         }
      });
  });
};
