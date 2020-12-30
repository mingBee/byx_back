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
  CODE_SUCCESS
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');
const { formatDate } = require('../utils/format');
const { findMealsHasProj }  = require('./cusmMealService');
// 查询项目记录列表
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
    let query = `select d.id from PROJECT_RECORD d`;
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
        let query_2 = `select d.id, d.cusmname as cusmName, d.cusmid as cusmId, GROUP_CONCAT(p.name) as projNames, d.projids as projIds, DATE_FORMAT( d.consmtime, "%Y-%m-%d" ) as consmTime 
        from PROJECT_RECORD d, PROJECT p where d.cusmname like "%${name}%" and FIND_IN_SET( p.id, d.projids ) > 0 GROUP BY d.id` + ` limit ${n} , ${pageSize}`;
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

function updateMealNumber(req, res, next){
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { cusmId, projIds } = req.body;
    const query = `select d.id, p.projids as projids from CUSTOMER_MEAL d 
    LEFT JOIN PROJECT_MEAL p ON d.mealid = p.id
    WHERE d.cusmid = ${cusmId} order by starttime asc`;
    querySql(query).then(result=>{
      let choiceIds = [];
      let tempIds = [];
      let temp = projIds.split(',');
      for(let j=0;j<result.length;j++){
        if(temp.length == 0) break;
        for(let i=temp.length-1;i>-1;i--){
          let index = result[j].projids.indexOf(temp[i]);
          if(index>-1){
            let innerIdx = tempIds.indexOf(result[j].id)
            if(innerIdx>-1){
              choiceIds[innerIdx].num=choiceIds[innerIdx].num + 1
                
            }else {
              choiceIds.push(
                {
                  id:result[j].id,
                  num:1
                });
                tempIds.push(result[j].id);
            }
            temp.splice(i,1);
          }
        }
      }
      let updateParam = '';
      choiceIds.forEach(i=>{
        updateParam += `WHEN ${i.id} THEN number-${i.num} `; 
      })
      const query1 = `UPDATE CUSTOMER_MEAL
      SET number = CASE id 
      ${updateParam}
      END
      WHERE id IN (${tempIds})`;
      querySql(query1).then(result1=>{
        if (!result1 || result1.length === 0) {
          res.json({ 
            code: CODE_ERROR, 
            msg: '更改次数失败', 
            data: null 
          })
        }else{
          add(req, res, next);
        }
        
      })
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
    let { cusmName='', cusmId, projIds, consmTime } = req.body;
    const query = `insert into PROJECT_RECORD (cusmname, cusmid, projids, consmtime, createtime) values ('${cusmName}', ${cusmId}, '${projIds}', '${consmTime}', NOW())`;
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
    let { id, cusmName='', cusmId, projIds, consmTime } = req.body;
    find(id, 2)
    .then(response => {
      if (response) {
        const query = `update PROJECT_RECORD set cusmname='${cusmName}', cusmid =${cusmId}, projids= '${projIds}', consmtime = '${consmTime}', updatetime= NOW() where id='${id}'`;
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
        const query = `DELETE FROM PROJECT_RECORD where id=${id}`;
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

// 按月份查询项目记录统计(不分页)
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
    let dateQuery = cusmId ? 'and':'where'+` d.consmtime between date_sub(now(),interval 5 month) and now()`; //默认获取近半年的数据
    if(date && date.length>0){
      dateQuery = cusmId ? 'and':'where'+` d.consmtime between '${date[0]}' and '${date[1]}'`;
    }
    let query = `select DATE_FORMAT( d.consmtime , "%Y-%m") AS consmTime, GROUP_CONCAT(j.id) as projIds ,GROUP_CONCAT(j.name) as projNames, 
    GROUP_CONCAT(DISTINCT j.id) as projAllIds ,GROUP_CONCAT(DISTINCT j.name) as projAllNames
    from PROJECT_RECORD d 
    LEFT JOIN PROJECT j ON FIND_IN_SET( j.id, d.projids ) > 0 
    ${idQuery} ${dateQuery}
    GROUP BY DATE_FORMAT( d.consmtime, "%Y-%m" ) order by DATE_FORMAT( d.consmtime, "%Y-%m" )`;
    querySql(query)
    .then(data => {
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '暂无数据', 
        	data: []
        })
      } else {
        let projAllIds =[];
        let projAllNames = [];
        data.forEach(i=>{
          projAllIds = projAllIds.concat(i.projAllIds.split(','));
          projAllNames = projAllNames.concat(i.projAllNames.split(','));
        })
        projAllIds = Array.from(new Set(projAllIds));
        projAllNames = Array.from(new Set(projAllNames));
        data.forEach(i=>{
          if(i.projIds){
            let tempIds = [];
            let formatIds = [];
            let projIds = i.projIds.split(',');
            let projNames = i.projNames.split(',');
            projIds.forEach(( x, outIndex )=>{
              let index = tempIds.indexOf(x);
              if(index>-1){
                formatIds[index].num += 1;
              }else{
                tempIds.push(x);
                formatIds.push(
                  {
                    id: x,
                    name: projNames[outIndex],
                    num: 1
                  })
              }
            })
            i.formatIds = formatIds;
          }
        })
        let result = {};
        result.data = data.map(i=>{
          return {
            consmTime: i.consmTime,
            formatIds: i.formatIds,
          }
        })
        result.projAllIds = projAllIds;
        result.projAllNames = projAllNames
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '查询数据成功', 
          data: result
        })
      }
    })
  }
}

// 查询某一月份每天的项目记录统计(不分页)
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
    let dateQuery = cusmId ? 'and':'where' + ` DATE_FORMAT( d.consmtime , "%Y-%m") = DATE_FORMAT( now() , "%Y-%m")`;
    if(date){
      dateQuery =cusmId ? 'and':'where' + ` DATE_FORMAT( d.consmtime , "%Y-%m") = '${date}'`;
    }
    let query = `select DATE_FORMAT( d.consmtime , "%d") AS consmTime, GROUP_CONCAT(j.id) as projIds ,GROUP_CONCAT(j.name) as projNames
    from PROJECT_RECORD d 
    LEFT JOIN PROJECT j ON FIND_IN_SET( j.id, d.projids ) > 0 
    ${idQuery} ${dateQuery}
    GROUP BY DATE_FORMAT( d.consmtime, "%Y-%m-%d" ) order by DATE_FORMAT( d.consmtime, "%Y-%m-%d" )`;

    querySql(query)
    .then(data => {
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '暂无数据', 
        	data: []
        })
      } else {
        let projAllIds =[];
        let projAllNames = [];
        data.forEach(i=>{
          projAllIds = projAllIds.concat(i.projIds.split(','));
          projAllNames = projAllNames.concat(i.projNames.split(','));
        })
        projAllIds = Array.from(new Set(projAllIds));
        projAllNames = Array.from(new Set(projAllNames));
        data.forEach(i=>{
          if(i.projIds){
            let tempIds = [];
            let formatIds = [];
            let projIds = i.projIds.split(',');
            let projNames = i.projNames.split(',');
            projIds.forEach(( x, outIndex )=>{
              let index = tempIds.indexOf(x);
              if(index>-1){
                formatIds[index].num += 1;
              }else{
                tempIds.push(x);
                formatIds.push(
                  {
                    id: x,
                    name: projNames[outIndex],
                    num: 1
                  })
              }
            })
            i.formatIds = formatIds;
          }
        })
        let result = {};
        result.data = data.map(i=>{
          return {
            consmTime: i.consmTime,
            formatIds: i.formatIds,
          }
        })
        result.projAllIds = projAllIds;
        result.projAllNames = projAllNames
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
    query = `select id from PROJECT_RECORD where name='${param}'`;
  } else {
    query = `select id from PROJECT_RECORD where id='${param}'`;
  }
  return queryOne(query);
}

module.exports = {
  getList,
  add:updateMealNumber,
  update,
  del,
  getStatisList,
  getMonthStatisList
}
