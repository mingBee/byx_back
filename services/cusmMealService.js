/**
 * 描述: 业务逻辑处理 - 顾客套餐消费相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('../utils/index');
const boom = require('boom');
const { unique } = require('../utils/format');
const { body, validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');

// 查询顾客套餐消费列表
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
    name = name || '';

    let query = `select d.id from CUSTOMER_MEAL d`;
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

        let query_2 = `select d.id, d.cusmid as cusmId,c.name as cusmName, d.mealid as mealId,p.name as mealName, d.number, d.status, 
        GROUP_CONCAT(j.name) as projNames, d.starttime as startTime, d.endtime as endTime 
        from CUSTOMER_MEAL d 
        LEFT JOIN CUSTOMER c ON d.cusmid = c.id 
        LEFT JOIN PROJECT_MEAL p ON d.mealid = p.id 
        JOIN PROJECT j ON FIND_IN_SET( j.id, p.projids ) > 0
         where c.name like "%${name}%" GROUP BY d.id ORDER BY d.starttime ASC` + ` limit ${n} , ${pageSize}`;
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

// 查询顾客套餐消费列表(不分页)
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

    let query = `select d.id, d.cusmid as cusmId,c.name as cusmName, d.mealid as mealId, d.mealname as mealName, d.number, d.status, 
    GROUP_CONCAT(j.name) as projNames, d.starttime as startTime, d.endtime as endTime 
    from CUSTOMER_MEAL d 
    LEFT JOIN CUSTOMER c ON d.cusmid = c.id 
    LEFT JOIN PROJECT_MEAL p d.mealid = p.id
    LEFT JOIN PROJECT j ON FIND_IN_SET( j.id, p.projids ) > 0
    where c.name like "%${name}%"`;
    querySql(query_2);
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

// 添加顾客套餐消费
function add(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { cusmId, mealId, number=10, status='1' } = req.body;
    // find(name, 1)
    // .then(response => {
    //   if (response) {
    //     res.json({ 
    //       code: CODE_ERROR, 
    //       msg: '顾客套餐消费名称不能重复', 
    //       data: null 
    //     })
    //   } else {
        const query = `insert into CUSTOMER_MEAL (cusmid, mealid, number, status, starttime) values 
        ('${cusmId}', ${mealId},'${number}', '${status}', NOW())`;
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
    //   }
    // })

  }
}

// 更新顾客套餐消费信息
function update(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, cusmId, mealId, number, status='1' } = req.body;
    find(id, 2)
    .then(response => {
      if (response) {
        const query = `update CUSTOMER_MEAL set cusmid='${cusmId}', mealid=${mealId}, number=${number}, status='${status}' where id='${id}'`;
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

// 删除顾客已办套餐
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
        const query = `DELETE FROM CUSTOMER_MEAL where id=${id}`;
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
    query = `select id from CUSTOMER_MEAL where name='${param}'`;
  } else {
    query = `select id from CUSTOMER_MEAL where id='${param}'`;
  }
  return queryOne(query);
}

// 查询顾客套餐是否包含某些项目 方法
function findMealsHasProj(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { cusmId, projIds } = req.body;
    let query = `select d.id from CUSTOMER_MEAL d where d.cusmid =${cusmId}`;
    querySql(query)
    .then(data => {
      if (!data || data.length === 0) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '当前客户未办理项目套餐，请先办理套餐', 
          data: null 
        })
      } else {
        let query_2 = `select d.cusmid as cusmId, GROUP_CONCAT(p.projids) as projids
        from CUSTOMER_MEAL d 
        LEFT JOIN PROJECT_MEAL p ON d.mealid = p.id
        where d.cusmid =${cusmId} GROUP BY d.cusmid`;
        querySql(query_2)
        .then(result_2 => {
          if (!result_2 || result_2.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '当前消费项目未办理套餐，请先办理套餐', 
              data: null 
            })
          } else {
            let temp = result_2[0];
            let projids = unique(temp.projids);
            let list = projIds.split(',');
            let result = [];

            list.forEach(i=>{
              if(projids.indexOf(i) == -1){
                result.push(i);
              }
            })
            if(result.length == 0){
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '当前消费项目都已办套餐', 
                data: null 
              })
            }else{
              let query_3 = `select GROUP_CONCAT(j.name) as projNames from PROJECT j where FIND_IN_SET( j.id, '${result.join()}' ) > 0`;
              querySql(query_3)
              .then(result_3 => {
                let resultName = result_3[0].projNames;
                res.json({ 
                  code: CODE_ERROR, 
                  msg: `当前消费项目中${resultName}未办套餐`, 
                  data: {
                    ids:result,
                    name:resultName
                  } 
                })
              })
            }
          }
        })
      }
    })
  }
}

module.exports = {
  getList,
  getAllList,
  add,
  update,
  del,
  findMealsHasProj
}
