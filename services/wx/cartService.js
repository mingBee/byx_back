/**
 * 描述: 业务逻辑处理 - 购物车相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('@/utils/index');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { getCaption } = require('@/utils/format')
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');

// 查询购物车列表（包含有效和失效）
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let shopId = decode(req).id;
    let query = `select d.id from CART d where d.shopid = ${shopId}`;
    querySql(query)
    .then(data => {
    	// console.log('任务列表查询===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '暂无数据', 
        	data: {
            total:0,
            rows:[]
          }
        })
      } else {
        // 计算数据总条数
        let total = data.length; 
        // 拼接分页的sql语句命令 where name='${name}'
        let query_2 = `select d.id, d.shopid as shopId, d.number, d.prodid as prodId, d.check as checked, t.name as prodName, t.spec, 
        t.avatar, IFNULL(p.price,t.price) as price, t.isdel as isDel from CART d 
        LEFT JOIN PRODUCT t ON d.prodid = t.id 
        LEFT JOIN PRODUCT_PRICE p ON p.shopid = ${shopId} and d.prodid = p.prodid
        where d.shopid = ${shopId}`;
        querySql(query_2)
        .then(result_2 => {
          console.log('分页2===', result_2);
          if (!result_2 || result_2.length === 0) {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '暂无数据', 
              data: {
                total:0,
                rows:[]
              }
            })
          } else {
            const originUrl = req.headers.host;
            //validSign 0 有效 1 商品已下架 2 库存不足
            result_2.forEach(i=>{
              if(i.avatar){
                i.avatar = 'http://'+originUrl+'/static'+ i.avatar
              }
              i.stock = 999;
              i.validSign = 0;
              if(i.isDel=='1'){
                i.validSign = 1;
              }
              //库存校验
            })
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '查询数据成功', 
              data: {
                rows: result_2,
                total: total
              } 
            })
          }
        })
      }
    })
  }
}

// 查询购物车数量
function getCount(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let shopId = decode(req).id;
    let query = `select d.id from CART d where d.shopid = ${shopId}`;
    querySql(query)
    .then(data => {
    	// console.log('任务列表查询===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '暂无数据', 
        	data: {
            total:0
          }
        })
      } else {
        // 计算数据总条数
        let total = data.length; 
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '查询成功', 
          data: {
            total: total
          } 
        })
      }
    })
  }
}

//更新购物车
function change(req, res, next ){
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let shopId = decode(req).id;
    let { prodId='', number, spec } = req.body;
    find(shopId, prodId, spec)
    .then(task => {
      if(task){
        let id = task.id;
        if(number == 0){
          del( id, res )
        }else{
          update( id, number, res  );
        }
      }else {
        add(req, res, shopId );
      }
    })
  }
}

// 添加购物车
function add(req, res, shopId) {
  let { prodId='', number= 1, spec } = req.body;
  const query = `insert into CART (shopid, prodid, number, spec, createtime, updatetime) values 
  (${shopId}, ${prodId}, ${number}, '${spec}', NOW(), NOW())`;
  querySql(query)
  .then(data => {
    // console.log('添加任务===', data);
    if (!data || data.length === 0) {
      res.json({ 
        code: CODE_ERROR, 
        msg: '添加购物车失败', 
        data: null 
      })
    } else {
      res.json({ 
        code: CODE_SUCCESS, 
        msg: '添加购物车成功', 
        data: null 
      })
    }
  })
}

//编辑购物车信息
function update(id ,number, res) {
  const query = `update CART set  number=${number}, updatetime = NOW() where id='${id}'`;
  querySql(query)
  .then(data => {
    if (!data || data.length === 0) {
      res.json({ 
        code: CODE_ERROR, 
        msg: '更新失败', 
        data: null 
      })
    } else {
      res.json({ 
        code: CODE_SUCCESS, 
        msg: '更新成功', 
        data: null 
      })
    }
  })
}

// 删除购物车单个商品
function del(id, res) {
  const query = `DELETE FROM CART where id='${id}'`;
  querySql(query)
  .then(data => {
    // console.log('删除任务===', data);
    if (!data || data.length === 0) {
      res.json({ 
        code: CODE_ERROR, 
        msg: '删除购物车失败', 
        data: null 
      })
    } else {
      res.json({ 
        code: CODE_SUCCESS, 
        msg: '删除购物车成功', 
        data: null 
      })
    }
  })
}



// 清空购物车
function delAll(req, res ,next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    querySql(`SELECT FROM CART where shopid='${id}'`)
    .then(task => {
      if (task) {
        const query = `DELETE FROM CART where shopid='${id}'`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '清空购物车失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '清空购物车成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '删除数据失败，数据不存在', 
          data: null 
        })
      }
    })
  }
}

// 通过名称或ID查询数据是否存在
function find(shopId, prodId, spec) {
  let query = null;
  query = `select id, number from CART where shopid=${shopId} and prodid = ${prodId} and spec = '${spec}'`;
  return queryOne(query);
}

module.exports = {
  getList,
  change,
  delAll,
  getCount
}
