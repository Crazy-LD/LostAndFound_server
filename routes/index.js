let express = require('express');
let router = express.Router();
let formidable = require('formidable');
let uuidv1 = require('uuid');
let fs = require('fs');
let path = require('path');
const md5 = require('blueimp-md5');
const {
  UserModel,
  ChatModel,
  LostFoodModel
} = require('../db/models');
const filter = {password: 0, __v: 0};


/* 用户注册*/
router.post('/register', function (req, res) {
  const {username, password} = req.body;
  UserModel.findOne({username}, function (err, user) {
    if (user) {
      res.send({code: 1, msg: '用户已存在'});
    } else {
      new UserModel({username, password: md5(password)}).save(function (err, user) {
        // 生成一个 cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24});
        const data = {
          username,
          _id: user._id
        };
        res.send({code: 0, data});
      })
    }
  })
});
/* 用户登录*/
router.post('/login', function (req, res) {
  const {username, password} = req.body;
  UserModel.findOne({username, password: md5(password)}, filter, function (err, user) {
    if (!user) {
      res.send({code: 1, msg: '用户名或密码错误!'});
    } else {
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7});
      res.send({code: 0, data: user});
    }
  })
});
/* 用户更新信息 */
router.post('/update', function (req, res) {
  const user = req.body;
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: '请先登录'})
  }
  UserModel.findByIdAndUpdate({_id: userid}, user, function (err, oldUser) {
    if (err) {
      return res.send({code: 1, msg: '请先登录'})
    }
    if (!oldUser) {
      res.clearCookie('userid');
      res.send({code: 1, msg: '请先登录'})
    } else {
      const {_id, username} = oldUser;
      let data = Object.assign(user, {_id, username});
      res.send({code: 0, data})
    }
  })
});
/* 获取用户信息 */
router.get('/user', function (req, res) {
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: '请先登录'})
  }
  UserModel.findOne({_id: userid}, filter, function (error, user) {
    if (!user) {
      return res.send({code: 1, msg: '请先登录'})
    }
    res.send({code: 0, data: user});
  })
});
/* 获取消息列表 */
router.get('/msglist', function (req, res) {
  const userid = req.cookies.userid;
  UserModel.find(function (err, usersDoc) {
    const users = usersDoc.reduce((users, user) => {
      users[user._id] = {username: user.username, header: user.header, name: user.name};
      return users;
    }, {});
      ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
});
/* 修改消息为已读 */
router.post('/readmsg', function (req, res) {
  const {from} = req.body;
  const to = req.cookies.userid;
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    res.send({code: 0, data: doc.nModified})
  })
});
/*修改用户密码*/
router.post('/updatepassword', function (req, res) {
  const {oldPassword, password} = req.body;
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: '请先登录'});
  }
  UserModel.update({_id: userid, password: md5(oldPassword)}, {password: md5(password)}, function (err, doc) {
    if (doc.nModified === 0) {
      return res.send({code: 1, msg: '原始密码错误'})
    } else {
      res.send({code: 0});
    }
  })
});
/*发布消息*/
router.post('/sendarticle', function (req, res) {
  let form = new formidable.IncomingForm();
  const userid = req.cookies.userid;
  form.uploadDir = './uploads';
  form.parse(req, (err, fields, files) => {
    if (!err) {
      const {lName, address, contact, desc, imgCount, isLost} = fields;
      let promise = new Promise((resolve, reject) => {
        let images = [];
        if (files.images0) {
          for (let i=0; i<imgCount; i++) {
            let avatarName = uuidv1();
            let attrName = 'images' + i;
            let extName = path.extname(files[attrName].name);
            let oldPath =  './' + files[attrName].path;
            let newPath =  './uploads/' + avatarName + extName;
            let imgPath = avatarName +extName;
            fs.rename(oldPath, newPath, (err) => {
              if (err) {
                reject('改名错误');
              } else {
                images.push(imgPath);
                if (i === imgCount-1) {
                  resolve(images);
                }
              }
            })
          }
        } else {
          resolve(images);
        }
      });
      promise.then(images => {
        UserModel.findOne({_id: userid}, function (err, user) {
          if (!err) {
            const {username, header, name} = user;
            const create_time = Date.now();
            const _lostId = uuidv1();
            new LostFoodModel({_lostId, username, lName, images, address, desc, contact, create_time, status: 0, isLost}).save(function (err) {
              if (!err) {
                return res.send({code: 0, data: {header, name, images, contact, desc, address, status: 0, lName, create_time, _lostId, isLost}})
              }
            })
          }
        })
      }).catch(() => {
        return res.send({code: 1, msg: '上传错误'})
      })
    } else {
      res.send({code: 1, msg: '发布失败'})
    }
  })
});
/*请求所有的失物信息*/
router.get('/article', function (req, res) {
  UserModel.find(function (err, userDoc) {
    const users = userDoc.reduce((users, user) => {
      users[user.username] = {name: user.name, header: user.header, _id: user._id};
      return users;
    }, {});
    LostFoodModel.find(function (err, lostList) {
      if (!err) {
        const losts = lostList.reduce((losts, lost) => {
          losts.push({
            _lostId: lost._lostId,
            _id: users[lost.username]._id,
            status: lost.status,
            name: users[lost.username].name,
            header: users[lost.username].header,
            lName: lost.lName,
            address: lost.address,
            contact: lost.contact,
            images: lost.images,
            desc: lost.desc,
            create_time: lost.create_time,
            isLost: lost.isLost
          });

          return losts;
        }, []);
        return res.send({code: 0, data: losts})
      } else {
        return res.send({code: 1, msg: '获取失败'})
      }
    })
  })
});
/*改变消息状态*/
router.post('/changestatus', function (req, res) {
  const {_lostId, status} = req.body;
  LostFoodModel.update({_lostId}, {status}, function (err, doc) {
    if (doc.nModified === 0) {
      return res.send({code: 1, msg: '修改错误'})
    } else {
      res.send({code: 0});
    }
  })
});


module.exports = router;
