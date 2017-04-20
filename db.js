var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || 'development'; // node çalıştığı ortama göre env değişkenini doldurur.
// Bizim burada bunu tanımlama amacımız ise production ortamında yani heroku üzerinden calistirirken 
// postgres local üzerinde calistirirken ise sqlite kullanıcak olmamız..
var sequelize;

// DATABASE_URL degiskeni bize heroku app içerisinde yüklediğimiz addons olan heroku-postgresql den verildi..
// bu degisken kendi icerisinde connection string gibi verileri icermektedir. 
if (env === "production") {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}

var db = {};

// modeli sequelize ye yüklemek için sequelize.import fonksiyonunu kullaniyoruz..
db.todo  = sequelize.import(__dirname + "/models/todo.js");
db.user = sequelize.import(__dirname + "/models/user.js")
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;