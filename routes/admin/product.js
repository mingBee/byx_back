/**
 * 描述: 产品路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const service = require('@serve/admin/productService');
const upload = require('@/utils/upload');
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

// 还原产品接口
router.put('/backDel', service.backDel);

//产品缩略图上传
router.post('/upload', upload('prodAvatar').single('file'), service.upload);

module.exports = router;

