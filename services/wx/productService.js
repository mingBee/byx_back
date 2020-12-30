/**
 * 描述: 业务逻辑处理 - 产品相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('@/utils/index');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { getCaption } = require('@/utils/format')
const { 
  CODE_ERROR,
  CODE_SUCCESS
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');

// 查询产品列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, typeId} = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;
    typeId  = Number(typeId);
    let query = `select d.id, d.name from PRODUCT d where d.type = ${typeId} and isdel ='2'`;
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
        let shopId = decode(req).id;
        // 拼接分页的sql语句命令 where name='${name}'
        let query_2 = `select d.id, d.name,d.spec, IFNULL(p.price,d.price) as price, d.unit, d.avatar, d.type from PRODUCT d LEFT JOIN PRODUCT_PRICE p ON 
        d.id = p.prodid and p.shopid = ${shopId} where d.type = ${typeId} and d.isdel = '2'` + ` limit ${n} , ${pageSize}`;
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
              i.number=0;
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

// 查询产品分类列表(不分页)
function getTypeList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let query = `select d.id, d.name from PRODUCT_TYPE d where d.isdel = '2'`;
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

// 查询产品详情
function detail(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let id = req.query.id;
    let shopId = decode(req).id;
    let query = `select d.id, d.name, d.avatar, IFNULL(p.price,d.price) as price, IFNULL(c.number,0) as number, d.unit, d.spec from PRODUCT d
    LEFT JOIN PRODUCT_PRICE p ON d.id = ${id} and d.id = p.prodid
    LEFT JOIN CART c ON d.id = c.prodid and c.shopid = ${shopId}`;
    querySql(query)
    .then(data => {
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '暂无数据', 
        	data: []
        })
      } else {
        let result = data[0];
        let canBuyNumber = 0;
        result.stock = 999;
        let num = Number(result.stock || 0) - Number(result.number ||0);
        if(num >0){
          canBuyNumber = num;
        }else {
          canBuyNumber = 0;
        }
        result.canBuyNumber = canBuyNumber;
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '查询数据成功', 
          data: result
        })
      }
    })
  }
}

// 通过名称或ID查询数据是否存在
function find(param, type) {
  let query = null;
  if (type == 1) { // 1:添加类型 2:编辑或删除类型
    query = `select id, name from PRODUCT where name='${param}'`;
  } else {
    query = `select id, name from PRODUCT where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  getTypeList,
  detail
}
