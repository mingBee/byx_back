/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('@/utils/index');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');

// 获取用户信息
function getInfo(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { account ,id} = decode(req);
    const query = `select * from SYS_USER where account='${account}' and id='${id}'`;
    querySql(query)
    .then(user => {
    	// console.log('用户登录===', user);
      if (!user || user.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '用户名或密码错误', 
        	data: null 
        })
      } else {
        let userData = {
          id: user[0].id,
          account: user[0].account,
          nickname: user[0].nickname,
          avatar: user[0].avatar,
          roles:user[0].roles? user[0].roles.split(','):[]
        };
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '获取用户信息成功', 
        	data: userData
        })
      }
    })
  }
}

// 校验用户名和密码
function validateUser(username, oldPassword) {
	const query = `select id, username from sys_user where username='${username}' and password='${oldPassword}'`;
  	return queryOne(query);
}

// 通过用户名查询用户信息
function findUser(username) {
  const query = `select id, username from sys_user where username='${username}'`;
  return queryOne(query);
}

module.exports = {
  getInfo
}
