var nodemailer = require('nodemailer');
// var express = require('express');
// var router = express.Router();
var connectdb=require('../connectdb');
var async=require('async');
var config=require('../mail_config');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.user,
        pass: config.pass
    }
});

//---------------------------------------------------------------------
exports.sendmail=function(thisorderlist,thiscart){
  /*thisorderlist:當前訂單,thiscart：當前訂單的購物車*/
  // setup email data with unicode symbols
  var mailOptions = {
      from: 'rayTW0313@gmail.com', // sender address
      to: thisorderlist.email, // list of receivers
      // subject: 'Hello ✔', // Subject line
      // text: '訂單'+thisorderlist.id+'訂購成功,總計'+thiscart.total
  };
  var themailinfo={};
  async.waterfall([
    find_thismember_orderlist,
    get_thiscart_id_and_addtotemp,
    check_thisorderlist_isexist,
  ],function(err,result){
    // console.log(result);
    mailOptions.subject='訂購(修改)成功,訂單編號:'+result.id;
    mailOptions.text='訂單編號:'+result.id+'\n'+
                  '訂購商品:'+result.productnamearr+'\n'+
                  '該商品價格:'+result.productpricearr+'\n'+
                  '訂購數量:'+result.buynum+'\n'+
                  '總計'+thiscart.total;
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            return console.log(err);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });

  });
  //找到該會員訂單
  function find_thismember_orderlist(callback){
    selstr='SELECT *from orderlist where orderguy_id ='+thisorderlist.orderguy_id.toString();
    connectdb.query(selstr,function(err,rows){
      callback(null,rows);
    });
  }
  /*找到將該購物車id加至temp*/
  function get_thiscart_id_and_addtotemp(thisorder/*該筆訂單資料*/,callback){
    var themailinfo={
      id:thisorder[0].id,
      productnamearr:[],
      productpricearr:[],
      total:thiscart.total
    };
    var productsarr=thiscart.products_id.split(',');
    for(var i in productsarr){
      pickproducts(productsarr[i]);
    }
    var arr1=[];
    var arr2=[];
    var count=0;
    function pickproducts(id){
      var pickstr='SELECT * FROM products WHERE id='+id;
      connectdb.query(pickstr,function(err,rows){
        count++;
        arr1.push(rows[0].name);
        arr2.push(rows[0].price);
        themailinfo.productnamearr=arr1;
        themailinfo.productpricearr=arr2;
        if(count===productsarr.length){
          callback(null,themailinfo);
        }
      });
    }
    // callback(null,themailinfo);
  }
  /*判斷該訂單是否已存在*/
  function check_thisorderlist_isexist(themailinfo,callback){
    themailinfo.buynum=thiscart.products_quentity;
    callback(null,themailinfo);
}
};
