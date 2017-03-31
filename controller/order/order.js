var express = require('express');
var router = express.Router();
var create_cart_todb=require('../../model/order/create_cart_todb');
var create_cart_todb2=require('../../model/order/create_cart_todb2');
var delete_orderlist_todb=require('../../model/order/delete_orderlist_todb');
var orderlist_todb=require('../../model/order/orderlist_todb');
var payment_todb=require('../../model/order/payment_todb');
var report_todb=require('../../model/order/report_todb');
var update_orderlist_todb=require('../../model/order/update_orderlist_todb');

module.exports= class order{
  // create_cart(req,res){
  //   var item_ids=req.body.products_id;
  //   var item_nums=req.body.products_quentity;
  //   var orderguy_id=req.body.orderguy_id;
  //   create_cart_todb.check_cartfields(orderguy_id,item_ids,item_nums).then(function(result){
  //       create_cart_todb.create_cart(orderguy_id,item_ids,item_nums).then(function(result){
  //         res.json({message:result});
  //       }).catch(function(err){
  //         res.json({message:err});
  //       });
  //   }).catch(function(err){
  //     res.json({message:err});
  //   });
  // }
  create_cart2(req,res){
    var item_ids=req.body.products_id;
    var item_nums=req.body.products_quentity;
    var orderguy_id=req.body.orderguy_id;
    create_cart_todb2.check_cartfields(orderguy_id,item_ids,item_nums).then(function(result){  //取得符合系統參數
      res.json({message:result});
    }).catch(function(err){
      res.json({message:err});
    });
  }

  create_orderlist(req,res){   //建立訂單
    if(!isNaN(req.body.orderguy_id)){
      var email=req.body.email;
      var ispay=req.body.ispay;
      var orderguyId=req.body.orderguy_id;
      orderlist_todb.create_orderlist(email,ispay,orderguyId).then(function(result){
        res.json({message:result});
      });
    }
    else{ //如orderguy_id！==數字
      res.json({message:'請輸入正確會員id'});
      return;
    }
  }
  get_orderlist(req,res){    //取得所有訂單
    orderlist_todb.get_orderlist_info().then(function(result){
      res.json({list:result});
    });
  }
  payment(req,res){   //付款
    var orderid=req.query.id;
    payment_todb.pay(orderid).then(function(result){
      res.json({message:result});
    });
  }
  get_oneorderlist(req,res){    //取得單筆訂單
    var id=req.query.id;
    update_orderlist_todb.get_updateinfo(id).then(function(result){
      res.json({list:result});
    });
  }
  update_orderlist(req,res){  //更新訂單
    var temp=req.body;
    var orderid=req.query.id;
    update_orderlist_todb.edit_orderlist(orderid,temp).then(function(result){
      res.json({message:result});
    });
  }
  delete_orderlist(req,res){    //刪除訂單
    var orderid=req.query.id;
    delete_orderlist_todb(orderid).then(function(result){
      res.json({message:result});
    });
  }
  report(req,res){    //月報表
    var get_month=req.query.month;
    var get_year=req.query.year;
    report_todb.get_this_date_report(get_month,get_year).then(function(result){
      res.json({report:result});
    });
  }
};
