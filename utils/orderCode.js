const { formatDate, getRandom } = require('./format')
//生成编号
/**
 * 生成订单编号  (由编号类型编码+编号创建平台编码+6位日期+时间戳后4位+4位随机数组成)
 * 编号类型编码 codeType (1-支付订单,2-退款订单)
 * 编号平台编码 codePlatform (1-小程序，2-PC平台, 3-app平台, 4-移动web平台)
 */
function createOrderCode (codeType =1 , codePlatform = 1){
  codeType
  let now = new Date();
  let codeDate = formatDate(now,'yyMMdd');
  let codeTime = String(now.getTime()).substring(8);
  let codeRandom = getRandom(4);
  return String(codeType) + String(codePlatform) + codeDate + codeTime + String(codeRandom);
}

module.exports = {
  createOrderCode
}