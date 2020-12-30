/**
 * 描述: 业务逻辑处理 - 项目相关接口
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
const { formatDate } = require('../utils/format');
// 查询项目列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, name=''} = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;
    let query = `select d.id from PROJECT d`;
    querySql(query)
    .then(data => {
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
        let query_2 = `select d.id, d.name, d.weight, d.price from PROJECT d
         where d.name like "%${name}%"` + ` limit ${n} , ${pageSize}`;
        querySql(query_2)
        .then(result_2 => {
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
                total: total
              } 
            })
          }
        })
      }
    })
  }
}

// 查询项目记录列表(不分页)
function getAllList(req, res, next) {
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

    let query = `select d.id, d.name, d.weight, d.price from PROJECT d where d.name like "%${name}%"`;
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

// 添加项目记录
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { name='', weight='1', price=0 } = req.body;
    price = Number(price)||0;
    const query = `insert into PROJECT (name, weight, price ,createtime) values ('${name}', '${weight}', ${price}, NOW())`;
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
}

//更新项目
function update(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, name='', weight='1', price= 0 } = req.body;
    price = Number(price)||0;
    find(id, 2)
    .then(response => {
      if (response) {
        const query = `update PROJECT set name='${name}', weight ='${weight}', price=${price} where id='${id}'`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '操作数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '操作数据成功', 
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

// 删除项目记录
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
        const query = `DELETE FROM PROJECT where id=${id}`;
        // const query = `delete from sys_task where id='${id}'`;
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
  if (type == 1) { // 1:添加类型 2:编辑或删除类型
    query = `select id, name from PROJECT where name='${param}'`;
  } else {
    query = `select id, name from PROJECT where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  getAllList,
  add,
  update,
  del
}
