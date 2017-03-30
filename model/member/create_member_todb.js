var connectdb=require('../connectdb');
var base64str=require('./base64_encode_member');
var fs = require("fs");
var newmember;
module.exports=function(account,pwd,file) {
  return new Promise(function(resolve,reject){
    newmember={
      account:account,
      pwd:pwd,
      old_pic_name:'',
      photo:'',
      new_pic_name:'',
    };
    // checkmemberfield(resolve,newmember,temp,req);
    if((account==='')||(account===undefined)) {
      fs.unlink('./pic/member/'+file.filename);
      var account_fail='請輸入帳號';
      resolve(account_fail);
      return;
    }
    if((pwd==='')||(pwd===undefined))  {
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
      newmember.old_pic_name=file.originalname;
      newmember.new_pic_name=file.filename;
    }
    newmember.photo=base64str.base64_encode(file.filename);
    var selectstr="SELECT * FROM membertable where account="+"'"+newmember.account+"'";
    connectdb.query(selectstr, function(err, rows) {  //create newaccount
        if(err){
            reject(err);
        }
        if(rows.length!==0)   //判斷帳號是否重複
         {
           var fail='該會員已存在';
           fs.unlink('./pic/member/'+newmember.new_pic_name);  //如帳號存在不存圖
           resolve(fail);
         }
         else{
          var success='會員創建成功';
          connectdb.query("INSERT INTO membertable SET ?",newmember);  //沒重複建立
          resolve(success);
         }
      });
  });
};
