/**
 * 描述: 产品入库路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/productSaleService');

// 产品出货记录清单接口
router.get('/list', service.getList);

// 新增产品出货记录接口
router.post('/add', service.add);

module.exports = router;

