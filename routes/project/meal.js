/**
 * 描述: 套餐路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/projMealService');

// 套餐清单接口
router.get('/list', service.getList);

// 套餐清单接口
router.get('/allList', service.getAllList);

// 添加套餐接口
router.post('/add', service.add);

// 编辑套餐接口
router.put('/update', service.update);

// 删除套餐接口
router.delete('/del', service.del);

module.exports = router;

