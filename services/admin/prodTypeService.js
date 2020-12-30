/**
 * 描述: 业务逻辑处理 - 产品分类类型相关接口
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

// 查询产品分类类型列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, name='', isDel='2' } = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;

    let query = `select d.id, d.name from PRODUCT_TYPE d where d.isdel = '${isDel}'`;
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
        let query_2 = `select d.id, d.name from PRODUCT_TYPE d where d.name like "%${name}%" and d.isdel = '${isDel}'` + ` limit ${n} , ${pageSize}`;
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

// 查询产品分类列表(不分页)
function getAllList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { name } = req.query;
    // 默认值
    name = name || '';

    let query = `select d.id, d.name from PRODUCT_TYPE d where d.name like "%${name}%" and d.isdel = '2'`;
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

// 添加产品分类
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { name } = req.body;
    find(name, 1)
    .then(task => {
      if (task) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '产品分类名称不能重复', 
          data: null 
        })
      } else {
        const query = `insert into PRODUCT_TYPE (name) values ('${name}')`;
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
    })

  }
}

function update(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let {id, name } = req.body;
    find(id, 2)
    .then(product => {
      if (product) {
        const query = `update PRODUCT_TYPE set name='${name}' where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('点亮红星标记===', data);
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

// 删除产品分类
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
        const query = `update PRODUCT_TYPE set isdel='1' where id='${id}'`;
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


// 还原删除的产品分类
function backDel(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id } = req.body;
    find(id, 2)
    .then(task => {
      if (task) {
        const query = `update PRODUCT_TYPE set isdel='2' where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('删除任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '还原数据失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '还原数据成功', 
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
    query = `select id, name from PRODUCT_TYPE where name='${param}'`;
  } else {
    query = `select id, name from PRODUCT_TYPE where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  getAllList,
  add,
  update,
  del,
  backDel
}
