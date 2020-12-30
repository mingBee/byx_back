/**
 * 描述: 产品路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/wx/productService');
const { body } = require('express-validator');

// 校验是否传递类型id
const vaildator = [
  body('typeId').isEmpty().withMessage('请传递产品类型参数')
]

// 获取产品类型接口
router.get('/typeList', service.getTypeList);

// 获取分类下产品列表接口
router.get('/list',vaildator, service.getList);

// 获取产品详情接口
router.get('/detail', service.detail);

module.exports = router;

