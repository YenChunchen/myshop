var connectdb=require('../connectdb');
var fs=require('fs');
var base64str=require('./base64_encode_member');
var imgtodb;

module.exports=function(temp,thisid,file){
  return new Promise(function(resolve,reject){
    imgtodb={
      id:thisid,
      account:temp.account,
      pwd:temp.pwd,
      old_pic_name:'',
      photo:'',
      new_pic_name:'',
    };
    if((temp.account==='')||(temp.account===undefined)) {
      fs.unlink('./pic/member/'+file.filename);
      var account_fail='請輸入帳號';
      resolve(account_fail);
      return;
    }
    if((temp.pwd==='')||(temp.pwd===undefined))  {
      fs.unlink('./pic/member/'+file.filename);
      var pwd_fail='請輸入密碼';
      resolve(pwd_fail);
      return;
    }
    if (file===undefined) {
      var file_fail='未上傳檔案或檔案格式錯誤(jpg png)';
      resolve(file_fail);
      return;
    }
    else  {
      imgtodb.old_pic_name=file.originalname;
      imgtodb.new_pic_name=file.filename;
    }
    imgtodb.photo=base64str.base64_encode(file.filename);
    var selectstr='SELECT * FROM membertable WHERE id='+thisid;
    var updatestr='UPDATE membertable SET ? WHERE id='+thisid;
    connectdb.query(selectstr,function(err,rows) {
       if (err) {
         resolve(err);
       }
       if(rows.length===0) {  //如沒有該會員
         fs.unlink('./pic/member/'+imgtodb.new_pic_name);  //移除這次上傳檔案
         var nonexist='會員不存在';
         resolve(nonexist);
         return;
       }
       else{
         fs.unlink('./pic/member/'+rows[0].new_pic_name);  //移除前次圖檔
         imgtodb.id=rows[0].id;  //帳號保留前次值
         rows=imgtodb;   //將新資料取代舊資料(除account)
         connectdb.query(updatestr,rows,function(err,rows) {
           if (err) {
             reject(err);
           }
           else{
             var success='會員更新成功';
             resolve(success);
           }
         });
       }
    });
  });
};
