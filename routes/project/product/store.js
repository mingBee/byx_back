/**
 * 描述: 产品入库路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/productStoreService');

// 产品清单接口
router.get('/list', service.getList);

// 添加产品接口
router.post('/add', service.add);

module.exports = router;

