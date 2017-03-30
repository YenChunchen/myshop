var express = require('express');
var router = express.Router();
var Member=require('../controller/member/member.js');
var upload  = require('../controller/member/member_form_data_upload_multer');

var member=new Member();
router.get('/showallmember' , member.show_allmember);   //顯示所有會員
router.get('/showonemember' , member.show_onemember);  //顯示單筆會員
router.post('/createmember',upload.single('file') , member.create_member); //建立會員
router.put('/updatemember',upload.single('file') , member.update_member);  //更新會員
router.delete('/deletemember', member.delete_member);  //刪除會員


module.exports = router;
