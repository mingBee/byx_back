/**
 * 描述: 项目路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/projectService');

// 产品清单接口
router.get('/list', service.getList);

// 产品清单接口
router.get('/allList', service.getAllList);

// 添加产品接口
router.post('/add', service.add);

// 编辑产品接口
router.put('/update', service.update);

// 删除产品接口
router.delete('/del', service.del);

module.exports = router;

