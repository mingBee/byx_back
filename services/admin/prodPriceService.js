/**
 * 描述: 业务逻辑处理 - 产品价格调整相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('@/utils/index');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');

// 查询产品价格调整列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, shopName='',prodName='' } = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;

    let query = `select d.id from PRODUCT_PRICE d where d.shopname like "%${shopName}%" and d.prodname like "%${prodName}%"`;
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
        // 分页条件 (跳过多少条)
        let n = (pageNo - 1) * pageSize;
        // 拼接分页的sql语句命令
        let query_2 = `select d.id, d.shopname as shopName, d.prodname as prodName, d.shopid as shopId, d.prodid as prodId,
         d.price, d.createtime as createTime, d.updatetime as updateTime from PRODUCT_PRICE d 
         where d.shopname like "%${shopName}%" and d.prodname like "%${prodName}%"` + ` limit ${n} , ${pageSize}`;
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
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '查询数据成功', 
              data: {
                rows: result_2,
                total: total,
                pageNo: parseInt(pageNo),
                pageSize: parseInt(pageSize),
              } 
            })
          }
        })
      }
    })
  }
}

// 添加产品价格调整
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { shopName, shopId, prodName, prodId , price = 0} = req.body;
    find({shopName,prodName}, 1)
    .then(task => {
      if (task) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '产品价格已存在，请直接修改', 
          data: null 
        })
      } else {
        price= price && Number(price);
        const query = `insert into PRODUCT_PRICE (shopname, shopid, prodname, prodid, price, createtime, updatetime ) 
        values ('${shopName}', ${shopId}, '${prodName}', ${prodId}, ${price}, NOW(), NOW())`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '添加数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '添加数据成功', 
              data: null 
            })
          }
        })
      }
    })

  }
}

function update(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let {id, shopName, shopId, prodName, prodId , price = 0 } = req.body;
    find(id, 2)
    .then(product => {
      if (product) {
        const query = `update PRODUCT_PRICE set shopname='${shopName}', prodname='${prodName}', shopid='${shopId}', prodid='${prodId}',
        price='${price}', updatetime = NOW() where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('点亮红星标记===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '更新数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '更新价格成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '参数错误或数据不存在', 
          data: null 
        })
      }
    })
  }
}

// 删除产品价格调整
function del(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id } = req.query;
    find(id, 2)
    .then(task => {
      if (task) {
        const query = `DELETE FROM PRODUCT_PRICE where id=${id}`;
        querySql(query)
        .then(data => {
          // console.log('删除任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '删除数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '删除数据成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '数据不存在', 
          data: null 
        })
      }
    })
  }
}

// 通过名称或ID查询数据是否存在
function find(param, type) {
  let query = null;
  if (type == 1) { // 1:添加 2:编辑或删除
    query = `select id, shopname from PRODUCT_PRICE where shopname='${param.shopName}' and prodname = '${param.prodName}'`;
  } else {
    query = `select id, shopname from PRODUCT_PRICE where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  add,
  update,
  del
}
