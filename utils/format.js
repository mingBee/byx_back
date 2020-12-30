function formatDate (param,fmt){
  let date =new Date(param);
  var o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;
}

function unique(arr){
  var hash=[];
  arr = arr.split(',');
  for (var i = 0; i < arr.length; i++) {
     if(arr.indexOf(arr[i])==i){
      hash.push(arr[i]);
     }
  }
  return hash;
}

function getCaption(obj,sign,state) {
  var index=obj.lastIndexOf(sign);
  if(state==0){
  obj=obj.substring(0,index);
  }else {
  obj=obj.substring(index+1,obj.length);
  }
  return obj;
}

function getRandom(figure){
  let randomNum = Math.random() * (9*(10**(figure-1)));
  let baseNum = 10 ** (figure-1);
  return parseInt(baseNum + randomNum);
}

module.exports = {
  formatDate,
  unique,
  getCaption,
  getRandom
}