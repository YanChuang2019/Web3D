// scan all models defined in models:
//导入所有的models文件夹下的model，也就是构建好的数据模型

const fs = require('fs');
const db = require('./db');

let files = fs.readdirSync(__dirname + '/models');

let js_files = files.filter((f)=>{
    return f.endsWith('.js');
}, files);

module.exports = {};

for (let f of js_files) {
    console.log(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require(__dirname + '/models/' + f);//把所有的数据库交互文件暴露出去
}

module.exports.sync = () => {
    db.sync();
};
