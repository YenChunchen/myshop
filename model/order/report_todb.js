var connectdb=require('../connectdb');
var async=require('async');

exports.get_this_date_report=function(month,year){
  return new Promise(function(resolve,reject){
    async.waterfall([
      check_thisorderlist_isexist,
      get_thisdate_sales,
      get_uniquevalue,
      count_total,
    ],function(result){
      resolve(result);
      return result;
    });
    //取得符合欲查詢年月的已付款購物車清單
    function check_thisorderlist_isexist(callback){
      var thismonthcart=[];
      var selstr='select * from orderlist';
      connectdb.query(selstr,function(err,rows){
        for(var i in rows){
          rows[i].orderdate=rows[i].orderdate.split('/');
          if((rows[i].ispay===1)&&(rows[i].orderdate[1]===month)&&(rows[i].orderdate[0]===year)){
            thismonthcart.push(rows[i].cart_id);
          }
        }
        if(thismonthcart.length===0){
          var noexist='該月報表不存在';
          resolve(noexist);
          return;
        }
        else{
          callback(null,thismonthcart);
        }
      });
    }
    //整理該月賣出商品,數量及該月總合
    function get_thisdate_sales(thismonthcart,callback){
      var thismonth={
        title:year+'/'+month+'月報表',
      };
      var total=0,current=0;
      var saleitemarr='',saleitemquentityarr='';
      for(var i in thismonthcart){
        current++;
        var selstr='SELECT * FROM cart WHERE id='+thismonthcart[i];
        accountMonthTotal(selstr,current,thismonthcart.length);
      }
      function accountMonthTotal(selstr,current,max){
        connectdb.query(selstr,function(err,rows){
          total+=rows[0].total;
          if(current!==max){
            saleitemarr+=rows[0].products_id+',';
            saleitemquentityarr+=rows[0].products_quentity+',';
          }
          if(current===max){
            saleitemarr+=rows[0].products_id;
            saleitemquentityarr+=rows[0].products_quentity;
          }
          thismonth.monthTotal=total;
          thismonth.saleitem=saleitemarr;
          thismonth.saleitemquentity=saleitemquentityarr;
          if(current===max){
            callback(null,thismonth);
          }
        });
      }
    }
    /*整理出該月賣出商品唯一值並加總*/
    function get_uniquevalue(thismonth,callback){
      var arr1=thismonth.saleitem.split(',');
      var arr2=thismonth.saleitemquentity.split(',');
      var newarr1=[];
      var newarr2=[];
      newarr1=arr1.filter(function(current,index,arr){  //取商品唯一值
        return arr.indexOf(current)===index;
      });
      for(var i=0;i<=newarr1.length-1;i++){  //從唯壹一值去對該商品賣出數位置,加總
        var sum=0;
        for(var j=0;j<=arr1.length-1;j++){
          if(newarr1[i]===arr1[j]){
            sum=sum+parseInt(arr2[j]);
          }
        }
        newarr2.push(sum);
      }
      thismonth.saleitem=newarr1;
      thismonth.saleitemquentity=newarr2;
      callback(null,thismonth);
    }
    /*計算該月該商品賣出金額*/
    function count_total(thismonth,callback){
      thismonth.saleitemsum=[];
      thismonth.saleitemname=[];
      thismonth.saleitemprice=[];
      // console.log(thismonth);
      var thissum=0,current=0;
      for(var i in thismonth.saleitem){
        current++;
        var selstr='SELECT * FROM products WHERE id='+thismonth.saleitem[i];
        // console.log(selstr);
        count_total(thismonth.saleitemquentity[i],selstr,current,thismonth.saleitem.length);
      }
      function count_total(q,selstr,current,max){
        /*q:該次購買產品數量,selstr:SQL選取該次產品字串,current：目前計算到第幾個產品,max：總夠買產品種類*/
        connectdb.query(selstr,function(err,rows){
          var total=0;
          total+=q*rows[0].price;
          thismonth.saleitemname.push(rows[0].name);
          thismonth.saleitemprice.push(rows[0].price);
          thismonth.saleitemsum.push(total);
          if(current===max){
            callback(thismonth,null);
          }
        });
      }
    }
  });
};
