/**
 * 描述: 业务逻辑处理 - 基础相关接口
 * 作者: Jack Chen
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
  JWT_EXPIRED 
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');


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
    const query = `select * from sys_user where account='${account}' and password='${password}'`;
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
        // 登录成功，签发一个token并返回给前端
        const token = jwt.sign(
          // payload：签发的 token 里面要包含的一些数据。
          { account, id:user[0].id },
          // 私钥
          PRIVATE_KEY,
          // 设置过期时间
          { expiresIn: JWT_EXPIRED }
        )

        let userData = {
          id: user[0].id,
          account: user[0].account,
          nickname: user[0].nickname,
          avator: user[0].avator,
          sex: user[0].sex,
          gmt_create: user[0].gmt_create,
          gmt_modify: user[0].gmt_modify
        };
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '登录成功', 
        	data: { 
            token,
            userData
          } 
        })
      }
    })
  }
}


// 注册
function register(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { account, password } = req.body;
    findUser(account)
  	.then(data => {
  		// console.log('用户注册===', data);
  		if (data) {
  			res.json({
	      	code: CODE_ERROR, 
	      	msg: '用户已存在', 
	      	data: null 
	      })
  		} else {
	    	password = md5(password);
  			const query = `insert into SYS_USER(account, password) values('${account}', '${password}')`;
  			querySql(query)
		    .then(result => {
		    	// console.log('用户注册===', result);
		      if (!result || result.length === 0) {
		        res.json({ 
		        	code: CODE_ERROR, 
		        	msg: '注册失败', 
		        	data: null 
		        })
		      } else {
            const queryUser = `select * from SYS_USER where account='${account}' and password='${password}'`;
            querySql(queryUser)
            .then(user => {
              const token = jwt.sign(
                { account },
                PRIVATE_KEY,
                { expiresIn: JWT_EXPIRED }
              )
              let userData = {
                id: user[0].id,
                account: user[0].account,
                nickname: user[0].nickname,
                avator: user[0].avator,
                sex: user[0].sex,
                gmt_create: user[0].gmt_create,
                gmt_modify: user[0].gmt_modify
              };
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '注册成功', 
                data: { 
                  token,
                  userData
                } 
              })
            })
		      }
		    })
  		}
  	})
  }
}

// 重置密码
function resetPwd(req, res, next) {
	const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { account, oldPassword, newPassword } = req.body;
    oldPassword = md5(oldPassword);
    validateUser(account, oldPassword)
    .then(data => {
      console.log('校验用户名和密码===', data);
      if (data) {
        if (newPassword) {
          newPassword = md5(newPassword);
				  const query = `update SYS_USER set password='${newPassword}' where account='${account}'`;
				  querySql(query)
          .then(user => {
            // console.log('密码重置===', user);
            if (!user || user.length === 0) {
              res.json({ 
                code: CODE_ERROR, 
                msg: '重置密码失败', 
                data: null 
              })
            } else {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '重置密码成功', 
                data: null
              })
            }
          })
        } else {
          res.json({ 
            code: CODE_ERROR, 
            msg: '新密码不能为空', 
            data: null 
          })
        }
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '用户名或旧密码错误', 
          data: null 
        })
      }
    })
   
  }
}

// 校验用户名和密码
function validateUser(account, oldPassword) {
	const query = `select id, account from SYS_USER where account='${account}' and password='${oldPassword}'`;
  	return queryOne(query);
}

// 通过用户名查询用户信息
function findUser(account) {
  const query = `select id, account from SYS_USER where account='${account}'`;
  return queryOne(query);
}

module.exports = {
  login,
  register,
  resetPwd
}
