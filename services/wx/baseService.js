/**
 * 描述: 业务逻辑处理 - 小程序店铺登陆接口
 * 作者: Pluto Ming
 * 日期: 2020-06-20
*/


const { querySql, queryOne } = require('@/utils/index');
const md5 = require('@/utils/md5');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  WX_JWT_EXPIRED 
} = require('@/utils/constant');

// 登录
function login(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { account, password } = req.body;
    // md5加密
    password = md5(password);
    const query = `select * from shop where shopacct='${account}' and password='${password}'`;
    querySql(query)
    .then(shop => {
    	console.log('店铺登录===', shop);
      if (!shop || shop.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '账号或密码错误', 
        	data: null 
        })
      } else {
        // 登录成功，签发一个token并返回给前端
        const token = jwt.sign(
          // payload：签发的 token 里面要包含的一些数据。
          { account, id:shop[0].id },
          // 私钥
          PRIVATE_KEY,
          // 设置过期时间
          { expiresIn: WX_JWT_EXPIRED }
        )

        let shopData = {
          id: shop[0].id,
          shopName: shop[0].shopname,
          admin: shop[0].admin,
          phone: shop[0].phone,
          address: shop[0].address
        };

        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '登录成功', 
        	data: { 
            token,
            shopData
          } 
        })
      }
    })
  }
}
// // 校验用户名和密码
// function validateUser(username, oldPassword) {
// 	const query = `select id, username from SYS_USER where username='${username}' and password='${oldPassword}'`;
//   	return queryOne(query);
// }

// // 通过用户名查询用户信息
// function findUser(username) {
//   const query = `select id, username from SYS_USER where username='${username}'`;
//   return queryOne(query);
// }

module.exports = {
  login
}
