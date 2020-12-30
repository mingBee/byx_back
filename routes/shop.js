/**
 * 描述: 消费记录路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/admin/shopService');

// 顾客清单接口
router.get('/list', service.getList);

// 添加顾客接口
router.post('/add', service.add);

// 编辑顾客接口
router.put('/update', service.update);

// 删除顾客接口
router.delete('/del', service.del);

// 按月份分组统计接口
router.post('/statisList', service.getStatisList);

// 某月每天统计接口
router.post('/monthStatisList', service.getMonthStatisList);


module.exports = router;

