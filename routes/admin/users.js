/**
 * 描述: 用户路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
// const { body } = require('express-validator');
const service = require('@serve/admin/userService');

// 用户登录路由
router.get('/info', service.getInfo);

module.exports = router;

