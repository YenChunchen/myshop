var fs=require('fs');
exports.base64_encode=function(file) {   //img 轉 base64 string
  var bitmap = fs.readFileSync('pic/products/'+file);  //存放該路徑檔案
  var base64str=new Buffer(bitmap).toString('base64');  //轉base64
  return base64str;
};
