var express = require("express");

// Şifreleme için kullanilan module
var bcrypt = require("bcrypt");
// route yazildiginda POST ile gelen JSON requestlerini parse edip almak için kullanabileceğimiz module..
var bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 3000;

// underscore modülü array üzerinde istediğimiz gibi sorgulama gibi işlemleri yapmamıza olanak sağlar..
// underscorejs.org üzerinden daha fazla bilgiye erişilebilinir..
var _ = require("underscore");

/* ************* Database Bağlantısı ********** */
var db = require("./db.js");
/* ******************************************** */

var todos = [];
var todoNextId = 1;

// JSON request geldiğinde express bunu bodyParser sayesinde alıp parse edebilir..
// bunun için middleware ile yaptığımız gibi app.use() metodunu kullanıyoruz..
app.use(bodyParser.json());

// GET /todos
app.get("/todos", function (req, res) {

    // Database Bağlantılı....

    var query = req.query;
    var where = {};


    if (query.hasOwnProperty("completed") && query.completed == "true") {
        where.completed = true;
    } else if (query.hasOwnProperty("completed") && query.completed == "false") {
        where.completed = false;
    }

    if (query.hasOwnProperty("q") && query.q.trim().length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        }
    }

    db.todo.findAll({ where: where }).then(function (todos) {
        res.json(todos);
    }, function () {
        res.status(500).send();
    })
})

// GET /todos/:id
app.get("/todos/:id", function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    // DB Bağlantılı...

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            return res.json(todo.toJSON());
        } else {
            return res.status(404).send();
        }

    }, function (e) {
        // Eğer server ile ilgili bir problem olursa 500 kodu geri döndür..
        return res.status(500).send();
    });
})

// POST /todos
app.post("/todos", function (req, res) {
    //body ile gelen verileri almak için bodyParser kullanıyoruz..

    // underscore içerisindeki pick() metodunun amacı gelen object içerisindeki istenilen 
    // alanları alıp yeni bir object oluşturmasıdır.
    // bize post ile gelen JSON objesinde description ve completed haricinde bir alan istemediğimiz için
    // pick() metoduyla diğer alanları eliyoruz..
    var body = _.pick(req.body, "description", "completed");

    // DB Bağlantılı...

    db.todo.create(body).then(function (todo) {
        return res.json(todo.toJSON());
    }, function (e) {
        return res.status(400).json(e.toJSON());
    })
})

// DELETE /todos/:id

app.delete("/todos/:id", function (req, res) {

    var todoId = parseInt(req.params.id, 10);

    // Database Bağlantısı...

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowDeleted) {
        if (rowDeleted === 0) {
            return res.status(404).json({
                error: "id doesn't exists"
            });
        } else {
            // 204 kodu herşey doğru gitti ve geri döndürülecek bir veri yok..
            // sil için kullanilabilecek response kodu.
            return res.status(204).send();
        }

    }, function () {
        return res.status(500).send();
    })
})

// PUT /todos/:id

app.put("/todos/:id", function (req, res) {

    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, "description", "completed");
    var attributes = {};

    if (body.hasOwnProperty("completed")) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty("description")) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            })
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    })
})

// POST /users/
app.post("/users", function (req, res) {

    var body = _.pick(req.body, "email", "password");

    db.user.create(body).then(function (user) {
        res.json(user.toPublicJSON());
    }, function (e) {
        // res.status(400).send(e.toJSON());
        res.status(400).json(e);
        // ikside aynı işlemi yapıyor..
        // verilerde bir problem olduğunda 400 kodu geri dondurulebilir..
    })

})

// POST /users/login/

app.post("/users/login", function (req, res) {

    var body = _.pick(req.body, "email", "password");

    db.user.authenticate(body).then(function (user) {
        res.json(user.toPublicJSON());
    }, function () {
        res.status(401).send();
    })
})

db.sequelize.sync({force : true}).then(function () {
    console.log("Everything is synced");
    app.listen(PORT, function () {
        console.log("Express listening on " + PORT + " !");
    })
})

