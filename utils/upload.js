const multer = require('multer');
const path = require('path');
const { getCaption } = require('./format')

function setUpload(pathParam){
  let upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, path.join(__dirname,`../public/imgs/${pathParam}`));
      },
      filename: function (req, file, cb) {
        let fileName = getCaption(file.originalname,'.',0);
        let fileType = getCaption(file.originalname,'.',1);
        var changedName = fileName +'_'+ (new Date().getTime())+'.'+fileType;
        cb(null, changedName);
      }
    }),
    limits: { fileSize: 1000000 }
  });
  return upload;
}
// //多个文件上传
// router.post('/multer', upload.array('multerFile'), (req, res) => {
//     console.log(req.files);
//     let fileList = [];
//     req.files.map((elem) => {
//         fileList.push({
//             originalname: elem.originalname
//         })
//     });
//     res.json({
//         code: '0000',
//         type: 'multer',
//         fileList: fileList
//     });
// });
 
module.exports = setUpload;