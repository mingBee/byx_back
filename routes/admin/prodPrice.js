/**
 * 描述: 产品价格路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/admin/prodPriceService');
// 产品价格清单接口
router.get('/list', service.getList);

// 添加产品价格接口
router.post('/add', service.add);

// 编辑产品价格接口
router.put('/update', service.update);

// 删除产品价格接口
router.delete('/del', service.del);

module.exports = router;

