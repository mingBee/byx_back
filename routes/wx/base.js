/**
 * 描述:  基本路由模块
 * 作者: pluto
 * 日期: 2020-11-04
*/

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const service = require('@serve/wx/baseService');

// 登录/注册校验
const vaildator = [
  body('account').isString().withMessage('用户名类型错误'),
  body('password').isString().withMessage('密码类型错误')
]
// 用户登录路由
router.post('/base/login', vaildator, service.login);

module.exports = router;

