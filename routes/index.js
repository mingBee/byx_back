/**
 * 描述: 初始化路由信息，自定义全局异常处理
 * 作者: Pluto Ming
 * 日期: 2020-12-15
*/

const express = require('express');
// const boom = require('boom'); // 引入boom模块，处理程序异常状态
const admin_baseRouter = require('./admin/base'); // 引入admin 的 base路由模块
const admin_userRouter = require('./admin/users'); // 引入user路由模块
const admin_shopRouter = require('./admin/shop'); // 引入product路由模块
const admin_prodRouter = require('./admin/product'); // 引入product路由模块
const admin_prodTypeRouter = require('./admin/prodType'); // 引入产品类型路由模块
const admin_prodPriceRouter = require('./admin/prodPrice'); // 引入产品类型路由模块

const wx_baseRouter = require('./wx/base'); // 引入wx 的 base路由模块
const wx_prodRouter = require('./wx/product'); // 引入wx 的 产品路由模块
const wx_cartRouter = require('./wx/cart'); // 引入wx 的 购物车路由模块
const wx_orderRouter = require('./wx/order'); // 引入wx 的 订单路由模块

const { jwtAuth, decode } = require('../utils/user-jwt'); // 引入jwt认证函数
const router = express.Router(); // 注册路由 

router.use(jwtAuth); // 注入认证模块

//admin 后台路由模块
router.use('/api/admin/', admin_baseRouter); // 注入基础路由模块
router.use('/api/admin/user', admin_userRouter); // 注入用户路由模块
router.use('/api/admin/shop', admin_shopRouter); // 注入店铺路由模块
router.use('/api/admin/product', admin_prodRouter); // 注入产品路由模块
router.use('/api/admin/prodType', admin_prodTypeRouter); // 注入产品路由模块
router.use('/api/admin/prodPrice', admin_prodPriceRouter); // 注入产品路由模块
//wx 后台路由模块
router.use('/api/wx/', wx_baseRouter); // 注入基础路由模块
router.use('/api/wx/product', wx_prodRouter); // 注入产品路由模块
router.use('/api/wx/cart', wx_cartRouter); // 注入购物车路由模块
router.use('/api/wx/order', wx_orderRouter); // 注入订单路由模块

// 自定义统一异常处理中间件，需要放在代码最后
router.use((err, req, res, next) => {
  // 自定义用户认证失败的错误返回
  console.log('err===', err);
  if (err && err.name === 'UnauthorizedError') {
    const { status = 401, message } = err;
    // 抛出401异常
    res.status(status).json({
      code: status,
      msg: '授权失效，重新登录',
      data: null
    })
  } else {
    const { output } = err || {};
    // 错误码和错误信息
    const errCode = (output && output.statusCode) || 500;
    const errMsg = (output && output.payload && output.payload.message) || err.message;
    res.status(errCode).json({
      code: errCode,
      msg: errMsg
    })
  }
})

module.exports = router;