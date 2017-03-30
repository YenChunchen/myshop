var express = require('express');
var router = express.Router();
var create_product_todb=require('../../model/products/create_product_todb');
var delete_product_todb=require('../../model/products/delete_product_todb');
var show_product_todb=require('../../model/products/show_product_todb');
var update_product_todb=require('../../model/products/update_product_todb');
var url=require('url');

module.exports= class products{
  show_products(req,res){    //顯示單頁商品資料
    var get_url=url.parse(req.url,true).query;
    var rangestr='';
        var current=parseInt(get_url.page);
        var x,y; //x為該頁第一筆,y為該頁最末筆
        if(getpage.page===undefined)
        {x=0;y=20;}
        else{
          if(getpage.page==='NaN'){   //如果沒有page uri querystring
            x=0;  //則顯示第一頁
            y=20;
          }
          else{
            x=(current-1)*20;   //page: 1  2   3
            y=(current*20);   //   x: 0  20  40
          }                     //   y: 19 39  59
        }
    rangestr=x+","+y;
    show_product_todb("SELECT id,name,price,store FROM products limit "+rangestr).then(
      function(rows){
        res.json({list:rows});
      }
    );
  }
  show_oneproduct(req,res){    //顯示單筆商品資料
    var id =req.query.id;
    update_product_todb.get_oneitem(id).then(
      function(rows){
        if(rows.length!==0)
          res.json({list:rows});
        else
          res.json({fail:'無該項商品'});
      }
    );
  }
  create_item(req,res){   //建立商品資料
    var temp=req.body;
    var file=req.file;
    create_product_todb(temp,file).then(function(result){
      res.json({message:result});
    });
  }
  update_item(req,res){   //更新商品資料
    var temp=req.body;
    var file=req.file;
    var id=req.query.id;
    update_product_todb.edititem(temp,file,id).then(
      function(result){
        res.json({message:result});
      }
    );
  }
  delete_item(req,res){   //刪除多筆商品資料
    var delitems =req.body.id;
    var delarr=delitems.split(',');
    var current=0,check=0,max=delarr.length;
    var failarr=[],successarr=[];
    for(var i in delarr)
    {
      current++;
      delete_product_todb.delete_products(delarr[i],current,max,res,failarr,successarr).then(function(result){
        res.json(result);
      });
    }
  }
};
