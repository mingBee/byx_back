/**
 * 描述: 订单路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/wx/orderService');
const { body } = require('express-validator');

// 校验是否传递状态status
const vaildator = [
  body('status').isEmpty().withMessage('请传递订单状态')
]
// 获取订单列表接口
router.get('/getList', vaildator, service.getList);

// 获取订单详情接口
router.get('/getDetail', service.getDetail);

// 新增订单接口
router.post('/add', service.add);

// 修改订单状态接口
router.put('/changeStatus', service.changeOrderStatus);

module.exports = router;

