/**
 * 描述: 项目路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/projRecordService');

// 项目记录列表接口
router.get('/list', service.getList);

// 添加项目记录接口
router.post('/add', service.add);

// 编辑项目记录接口
router.put('/update', service.update);

// 删除项目记录接口
router.delete('/del', service.del);

// 项目按月份统计接口
router.post('/statisMonth', service.getStatisList);

// 项目某月份统计接口
router.post('/statisDays', service.getMonthStatisList);


module.exports = router;

