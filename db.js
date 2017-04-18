var Sequelize = require("sequelize");
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect' : 'sqlite',
    'storage' : __dirname + '/data/dev-todo-api.sqlite'
});

var db = {};

// modeli sequelize ye yüklemek için sequelize.import fonksiyonunu kullaniyoruz..
db.todo = sequelize.import(__dirname + "/models/todo.js");
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;