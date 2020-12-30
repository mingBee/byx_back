/**
 * 描述: 产品分类路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/admin/prodTypeService');
// 产品分类清单接口
router.get('/list', service.getList);

// 产品分类清单接口
router.get('/allList', service.getAllList);

// 添加产品分类接口
router.post('/add', service.add);

// 编辑产品分类接口
router.put('/update', service.update);

// 删除产品分类接口
router.delete('/del', service.del);

// 编辑产品分类接口
router.put('/backDel', service.backDel);

module.exports = router;

