/**
 * 描述: 业务逻辑处理 - 消费记录相关接口
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
// 查询消费记录列表
function getList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, pageNo, name='' ,date} = req.query;
    // 默认值
    pageSize = pageSize ? pageSize : 10;
    pageNo = pageNo ? pageNo : 1;
    let dateQuery = "";
    if(date && date.length>0){
      dateQuery = `and d.dissipate between '${date[0]}' and '${date[1]}'`;
    }
    let query = `select d.id from CONSUME d`;
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

        let query_2 = `select d.id, d.name, d.cusmid, d.amount, d.settle, d.debt, d.dissipate from CONSUME d
         where d.name like "%${name}%" ${dateQuery} order by d.dissipate desc` + ` limit ${n} , ${pageSize}`;
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
            result_2.map(i=>{
              i.dissipate = formatDate(i.dissipate,'yyyy-MM-dd');
              return i;
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

// 查询消费记录列表(不分页)
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

    let query = `select d.id, d.name, d.cusmid, d.amount, d.settle, d.debt, d.dissipate from CONSUME d where d.name like "%${name}%"`;
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

// 添加消费记录
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { name='', cusmid , amount=0, dissipate='',settle='1',debt=0 } = req.body;
    amount = Number(amount)||0;
    debt = Number(debt)||0;
    cusmid = Number(cusmid);
    const query = `insert into CONSUME (name, cusmid, amount, settle, debt, dissipate) values ('${name}', ${cusmid}, ${amount}, '${settle}', ${debt}, '${dissipate}')`;
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

function update(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id,name='', cusmid , amount=0, dissipate='',settle='1',debt=0 } = req.body;
    amount = Number(amount)||0;
    debt = Number(debt)||0;
    cusmid = Number(cusmid);
    find(id, 2)
    .then(response => {
      if (response) {
        const query = `update CONSUME set name='${name}', cusmid =${cusmid}, amount=${amount}, dissipate='${dissipate}', settle='${settle}', 
        debt=${debt} where id='${id}'`;
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

// 删除消费记录
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
        const query = `DELETE FROM CONSUME where id=${id}`;
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

// 按月份查询消费记录统计(不分页)
function getStatisList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { cusmId='' ,date} = req.body;
    let idQuery = '';
    if(cusmId ){
      idQuery = `where d.cusmid = ${cusmId}`
    };
    let dateQuery = cusmId ? 'and':'where'+` d.dissipate between date_sub(now(),interval 5 month) and now()`; //默认获取近半年的数据
    if(date && date.length>0){
      dateQuery = cusmId ? 'and':'where'+` d.dissipate between '${date[0]}' and '${date[1]}'`;
    }
    let query = `select DATE_FORMAT( d.dissipate , "%Y-%m") AS dissipate, SUM( d.amount ) AS amount, SUM(d.debt ) AS
     debt from CONSUME d ${idQuery} ${dateQuery} GROUP BY DATE_FORMAT( d.dissipate, "%Y-%m" ) order by DATE_FORMAT( d.dissipate, "%Y-%m" )`;
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

// 查询某一月份每天的消费记录统计(不分页)
function getMonthStatisList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { cusmId='' ,date} = req.body;
    let idQuery = '';
    if(cusmId ){
      idQuery = `where d.cusmid = ${cusmId}`
    };
    let dateQuery = cusmId ? 'and':'where' + ` DATE_FORMAT( d.dissipate , "%Y-%m") = DATE_FORMAT( now() , "%Y-%m")`;
    if(date){
      dateQuery =cusmId ? 'and':'where' + ` DATE_FORMAT( d.dissipate , "%Y-%m") = '${date}'`;
    }
    let query = `select DATE_FORMAT( d.dissipate , "%d") AS dissipate, SUM( d.amount ) AS amount, SUM(d.debt ) AS debt from CONSUME d
     ${idQuery} ${dateQuery} GROUP BY DATE_FORMAT( d.dissipate, "%Y-%m-%d" ) order by DATE_FORMAT( d.dissipate, "%Y-%m-%d" )`;
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

// 通过名称或ID查询数据是否存在
function find(param, type) {
  let query = null;
  if (type == 1) { // 1:添加类型 2:编辑或删除类型
    query = `select id, name from CONSUME where name='${param}'`;
  } else {
    query = `select id, name from CONSUME where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  getAllList,
  add,
  update,
  del,
  getStatisList,
  getMonthStatisList
}
