function a(){
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      resolve();
      console.log("Helloa");
    }, 3000);
  });
}
function b(){
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      console.log("Hellob");
      resolve();
    }, 2000);
  });}
function c(){
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      console.log("Helloc");
      resolve();
    }, 1000);
  });}

async function test () {
  try{
    await a();
    await b();
    await c();
  }
  catch(err){
    console.log(err);
  }

}
test();



//Promise的then=await    需用try catch去抓promise中的reject  用變數去抓resolve
