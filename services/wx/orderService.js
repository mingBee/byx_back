/**
 * 描述: 业务逻辑处理 - wx订单相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('@/utils/index');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { getCaption } = require('@/utils/format')
const { createOrderCode } = require('@/utils/orderCode')
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');

// 查询订单列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, status} = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;

    let query = `select id, status from ORDERS`;
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
        // 拼接分页的sql语句命令 where name='${name}'
        let query_2 = `select d.id, d.code, d.spec, d.price, d.unit, d.avatar, d.type from ORDERS d
         where d.status = '${status}'` + ` limit ${n} , ${pageSize}`;
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
            result_2.forEach(i=>{
              if(i.avatar){
                i.avatar = 'http://'+originUrl+'/static'+ i.avatar
              }
            })
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

// 查询订单详情
function getDetail(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let {  name } = req.query;
    // 默认值
    name = name || '';

    let query = `select d.id, d.name from ORDERS d where d.name like "%${name}%"`;
    querySql(query)
    .then(data => {
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '暂无数据', 
        	data: []
        })
      } else {
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '查询数据成功', 
          data
        })
      }
    })
  }
}

// 添加订单
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let shopId = decode(req).id;
    let { prods = '', nums = '', remark='' } = req.body;
    let code = createOrderCode();
    let status = '1';
    if(!prods){
      res.json({ 
        code: CODE_ERROR, 
        msg: '订单商品不能为空', 
        data: null 
      })
    }
    const query = `insert into ORDERS (shopid, prodids, number, remark, code, status, createtime, sendtime) values (${shopId}, '${prods}', '${nums}', '${remark}', '${code}', '${status}', NOW(), NOW())`;
    querySql(query)
    .then(data => {
      // console.log('添加任务===', data);
      if (!data || data.length === 0) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '添加订单失败', 
          data: null 
        })
      } else {
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '添加订单成功', 
          data: null 
        })
      }
    })
  }
}

//修改订单状态
function changeOrderStatus(req, res, next){
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, status } = req.query;
    find(id)
    .then(task => {
      if (task) {
        const query = `update ORDERS set status='${status}' where id='${id}'`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '更新订单状态失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '更新订单状态成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '订单不存在', 
          data: null 
        })
      }
    })
  }
}

// 取消订单
function del(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id } = req.query;
    find(id)
    .then(task => {
      if (task) {
        if(!task.status || task.status !='1'){
          res.json({ 
            code: CODE_ERROR, 
            msg: '只有待支付的订单可以取消', 
            data: null 
          })
        }
        const query = `DELETE ORDERS where id=${id}`;
        querySql(query)
        .then(data => {
          // console.log('删除任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '取消订单失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '取消订单成功', 
              data: null 
            })
          }
        })
      } else {
        res.json({ 
          code: CODE_ERROR, 
          msg: '订单不存在', 
          data: null 
        })
      }
    })
  }
}

// 通过名称或ID查询数据是否存在
function find(id) {
  let query = `select id, status from ORDERS where id=${id}`;
  return queryOne(query);
}

module.exports = {
  getList,
  getDetail,
  add,
  changeOrderStatus,
  del
}
