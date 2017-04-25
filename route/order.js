var express = require('express');
var router = express.Router();
var Order=require('../controller/order/order.js');
var order=new Order();
router.post('/createcart' , order.create_cart);  //建立購物車
router.post('/orderlist' , order.create_orderlist);  //建立訂單
router.get('/orderlist' , order.get_orderlist);  //取得所有訂單
router.get('/updateorderlist' , order.get_oneorderlist);    //更新單筆訂單
router.put('/payment' , order.payment);  //付款
router.put('/updateorderlist' , order.update_orderlist);   //更新訂單
router.delete('/deleteorderlist' , order.delete_orderlist);  //刪除訂單
router.get('/report' , order.report);  //月報


module.exports = router;
