/**
 * 描述: 购物车路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/wx/cartService');
const { body } = require('express-validator');

// 校验是否传递类型id
const vaildator = [
  body('typeId').isEmpty().withMessage('请传递购物车类型参数')
]

// 获取购物车接口
router.get('/list', service.getList);

// 获取购物车数量
router.get('/count', service.getCount);


// 更新购物车
router.post('/change',vaildator, service.change);

// 清空购物车
router.get('/delAll', service.delAll);



module.exports = router;

