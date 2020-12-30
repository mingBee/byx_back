/**
 * 描述: 入口文件
 * 作者: Jack Chen
 * 日期: 2020-06-12
*/
require('module-alias/register')  //引入路径带指组件
const path = require('path');
const mysql = require('mysql');
const config = require('./db/dbConfig');
const bodyParser = require('body-parser'); // 引入body-parser模块
const express = require('express'); // 引入express模块
const cors = require('cors'); // 引入cors模块
const routes = require('./routes'); //导入自定义路由文件，创建模块化路由
const https = require("https");
let fs = require("fs");
const app = express();

app.use(bodyParser.json()); // 解析json数据格式
app.use(bodyParser.urlencoded({extended: true})); // 解析form表单提交的数据application/x-www-form-urlencoded
app.use('/static', express.static(path.join(__dirname,'public')));  

app.use(cors()); // 注入cors模块解决跨域

app.use('/', routes);

// 路由请求超时的中间件
app.use(function (req, res, next) {
	// 这里必须是Response响应的定时器【120秒】
	res.setTimeout(12000*1000, function () {
			console.log("Request has timed out.");
			return res.status(408).send("请求超时")
	});
	next();
});

// app.listen(8088, () => { // 监听8088端口
// 	console.log('服务已启动 http://localhost:8088');
// })

const httpsOption = {
	key : fs.readFileSync("./https/2_binyixian.cn.key"),
	cert: fs.readFileSync("./https/1_binyixian.cn_bundle.crt")
}

https.createServer(httpsOption, app).listen(443,()=>{
	console.log('服务已启动 http://localhost:443');
});