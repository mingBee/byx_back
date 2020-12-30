/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('../utils/index');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');

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
    let { pageSize, pageNo, name } = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;
    name = name || '*';

    let query = `select d.prodname as prodName from PORD_STORE d`;
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
        let query_2 = `select d.prodname as name, d.number, DATE_FORMAT( d.createtime , "%y-%m-%d %H:%i:%s") as createTime, p.code from PORD_STORE d left join PRODUCT p ON d.prodid = p.id` + ` limit ${n} , ${pageSize}`;
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


// 添加产品
function add(prodName, prodId, number,res) {
  const query = `insert into PORD_STORE (prodname, prodid, number, createtime) values 
  ('${prodName}', '${prodId}',${number}, NOW() )`;
  querySql(query)
  .then(data => {
    // console.log('添加任务===', data);
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

//跟新产品数量
function updateNumber(req, res, next){
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { prodName, number, prodId } = req.body;
    number = Number(number) || 0;
    find(prodId, 2)
    .then(task => {
      if (!task) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '未发现此产品', 
          data: null 
        })
      } else {
        let curNum = Number(task.number) || 0;
        curNum = curNum + number;
        const query = `update PRODUCT set number=${curNum} where id='${prodId}'`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '更新数据失败', 
              data: null 
            })
          } else {
            add( prodName, prodId, number, res )
          }
        })
      }
    })
  }
}

// 通过名称或ID查询数据是否存在
function find(param, type) {
  let query = null;
  if (type == 1) { // 1:添加类型 2:编辑或删除类型
    query = `select id, name, number from PRODUCT where name='${param}'`;
  } else {
    query = `select id, name, number from PRODUCT where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  add:updateNumber
}
