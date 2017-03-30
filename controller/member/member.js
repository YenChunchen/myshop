var express = require('express');
var router = express.Router();
var upload  = require('./member_form_data_upload_multer');
var create_member_todb=require('../../model/member/create_member_todb');
var show_allmember_todb=require('../../model/member/show_allmember_todb');
var show_onemember_todb=require('../../model/member/show_onemember_todb');
var update_member_todb=require('../../model/member/update_member_todb');
var delete_member_todb=require('../../model/member/delete_member_todb');

module.exports= class member{
  show_allmember(req,res){   //顯示所有會員
    show_allmember_todb('SELECT * FROM membertable').then(
      function(rows){
        res.json({list:rows});
      }
    );
  }
  show_onemember(req,res){   //顯示單筆會員
    var id=req.query.id;
    show_onemember_todb(id).then(
      function(rows){
      res.json({list:rows});
    });
  }
  create_member(req,res){   //建立會員
    var account=req.body.account;
    var pwd=req.body.pwd;
    var file=req.file;
    create_member_todb(account,pwd,file).then(
      function(success){
        res.json({message:success});
    });
  }
  update_member(req,res){    //修改會員
    var temp=req.body;//暫存req一般欄位物件
    var thisid=req.query.id;
    var file=req.file;
    update_member_todb(temp,thisid,file).then(
      function(result){
        res.json({message:result});
    });
  }
  delete_member(req,res){   //刪除會員
    var id=req.query.id;
    delete_member_todb(id).then(
      function(result){
        res.json({message:result});
      }
    );
  }
};
