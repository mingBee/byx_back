/**
 * 描述: 店铺路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/admin/shopService');

// 店铺清单接口
router.get('/list', service.getList);

// 店铺不分页清单接口
router.get('/allList', service.getAllList);

// 添加店铺接口
router.post('/add', service.add);

// 编辑店铺接口
router.put('/update', service.update);

// 删除店铺接口
router.delete('/del', service.del);

// 还原店铺状态接口
router.put('/backStatus', service.backStatus);

// 修改店铺密码接口
router.put('/modifyPsd', service.modifyPsd);

module.exports = router;

