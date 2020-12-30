/**
 * 描述: 顾客套餐消费路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/cusmMealService');

// 顾客套餐消费清单接口
router.get('/list', service.getList);

// 顾客套餐消费不分页清单接口
router.get('/allList', service.getAllList);

// 添加顾客套餐消费接口
router.post('/add', service.add);

// 编辑顾客套餐消费接口
router.put('/update', service.update);

// 删除顾客套餐消费接口
router.delete('/del', service.del);

// 判断客户套餐是否含有项目接口
router.post('/mealsHasProj', service.findMealsHasProj);

module.exports = router;

