/**
 * 描述: 业务逻辑处理 - 店铺相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('@/utils/index');
const boom = require('boom');
const md5 = require('@/utils/md5');
const { body, validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('@/utils/constant');
const { decode } = require('@/utils/user-jwt');

// 查询店铺列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize = 10, pageNo = 1, shopName='',isDel='2' } = req.query;

    let query = `select d.id, d.shopName from SHOP d`;
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
        // 拼接分页的sql语句命令 where name='${name}'

        let query_2 = `select d.id, d.shopacct as shopAcct, d.shopname as shopName, d.phone, d.address, d.admin from SHOP d where d.shopname like "%${shopName}%" and d.isdel = ${isDel}` + ` limit ${n} , ${pageSize}`;
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

// 查询店铺列表(不分页)
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

    let query = `select d.id, d.shopname as name from SHOP d where d.shopname like "%${name}%"`;
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

// 添加店铺
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { shopName='', password='', shopAcct='', address='', phone='', admin ='',pshopId = 1} = req.body;
    pshopId = Number(pshopId);
    find({shopAcct,shopName}, 1)
    .then(response => {
      if (response) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '店铺账号或者店铺名称不能重复', 
          data: null 
        })
      } else {
        // md5加密 ,isdel='2'
        password = md5(password);
        const query = `insert into SHOP ( shopname, shopacct, password , address, phone, admin, pshopId ) values 
        ('${shopName}', '${shopAcct}','${password}', '${address}', '${phone}', '${admin}',${pshopId})`;
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
    let {id, shopName='', password='', shopAcct='', address='', phone='', admin ='',pshopId = 1} = req.body;
    find(id, 2)
    .then(response => {
      if (response) {
        const query = `update SHOP set shopname='${shopName}', shopacct='${shopAcct}', password='${password}', address='${address}', phone='${phone}', admin='${admin}', 
        pshopid=${pshopId} where id='${id}'`;
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

// 删除店铺
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
        const query = `update SHOP set isdel='1' where id='${id}'`;
        // const query = `delete from sys_task where id='${id}'`;
        querySql(query)
        .then(data => {
          // console.log('删除任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '删除店铺失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '删除店铺成功', 
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
// 还原店铺状态
function backStatus(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id } = req.body;
    find(id, 2)
    .then(task => {
      if (task) {
        const query = `update SHOP set isdel='2' where id='${id}'`;
        // const query = `delete from sys_task where id='${id}'`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '还原店铺状态失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '店铺状态已还原',
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


// 修改店铺密码
function modifyPsd(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, password} = req.body;
    find(id, 2)
    .then(task => {
      if (task) {
        password = md5(password);
        const query = `update SHOP set password='${password}' where id='${id}'`;
        // const query = `delete from sys_task where id='${id}'`;
        querySql(query)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '修改密码失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '修改密码成功',
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
    query = `select id, shopname from SHOP where shopacct='${param.shopAcct}' or shopname = '${param.shopName}'`;
  }else {
    query = `select id, shopname from SHOP where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  getAllList,
  add,
  update,
  del,
  backStatus,
  modifyPsd
}
