var express = require("express");

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

    // Local Variable...

    // URL den query alıp 
    // Array içerisindeki objeleri sorgulamak istersek
    // bunun için underscore içerisindeki where() metodundan faydalanabiliriz..

    // URL' deki query yi almak için request ile gelen query property sini kullanabiliriz
    // bu bize bir object döndürür..
    /*
        var queryParameters = req.query;
        var filteredTodos = todos;
    
        // Sorgulama yapabilmek için completed isimli alanın olup olmadığını kontrol ediyoruz..
        if (queryParameters.hasOwnProperty("completed") && queryParameters.completed === "true") {
            // eğer completed varsa ve true ise bir object olusturup onu sorguluyoruz..
            filteredTodos = _.where(filteredTodos, { completed: true });
        } else if (queryParameters.hasOwnProperty("completed") && queryParameters.completed === "false") {
            // eğer completed varsa ve false ise bir object olusturup onu sorguluyoruz..
            filteredTodos = _.where(filteredTodos, { completed: false });
        }
    
        // description alanına göre filter işlemi...
        // filtrelemek için underscore' un içerisinde bulunan filter metodunu kullanıyoruz
        // arama yapmak istediğimiz array' i filter içerisine parametre olarak aktardıktan sonra
        // indexOf ile istediğimiz alanda arama yapiyoruz.
        // aramalarsa case sensitive i ortadan kaldırmak için 
        // toLowerCase() ile tüm alanlari küçük harfe çeviriyoruz..
        if (queryParameters.hasOwnProperty("q") && queryParameters.q.trim().length > 0) {
            filteredTodos = _.filter(filteredTodos, function (todo) {
                return todo.description.toLowerCase().indexOf(queryParameters.q.toLowerCase()) > -1
            });
        }
    
        res.json(filteredTodos); */
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

    // Local Variable

    //    var matchedTodo = _.findWhere(todos, { id: todoId });

    // Brutal Metod...
    /*
        todos.forEach(function(todo){
            if(todoId === todo.id){
                matchedTodo = todo;
            }
        });
    */
    /*
        if (matchedTodo) {
            res.json(matchedTodo);
        } else {
            // Eğer herhangi bir kayıt bulunamazsa 404 durumunu gönder..
            res.status(404).send();
        }
    */
    //res.send("Asking todo with id of " + req.params.id);
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

    // Local Variable...


    // Validation
    // Gelen istekteki verilerin boolean, string veya description alanında bir verinin yazıp yazmadığını kontrol ettik.

    /*
    
        if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
            // 400 kodu anlamı : İstenilen veriler sağlanmadığı için 400 kodu ile geri döndürüyoruz cevabı..
            return res.status(400).send();
        }
    
        body.description = body.description.trim();
    
        body.id = todoNextId++;
    
        todos.push(body);
    
        console.log("Todo added " + body);
    
        res.json(body);
    */

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

    /*
        Local Variable...
    
        var matchedTodo = _.findWhere(todos, { id: todoId });
    
        if (matchedTodo) {
            todos = _.without(todos, matchedTodo);
            console.log("Silme işlemi başarılıdır!!");
            res.json(matchedTodo);
        } else {
            //return res.status(404).send();
            return res.status(404).json({ "error": "no matched record!!" });
        }
    */
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

    db.users.create(body).then(function(user){
        res.json(user.toJSON());
    }, function(e){
        // res.status(400).send(e.toJSON());
        res.status(400).json(e);
        // ikside aynı işlemi yapıyor..
        // verilerde bir problem olduğunda 400 kodu geri dondurulebilir..
    })

})

db.sequelize.sync().then(function () {
    console.log("Everything is synced");
    app.listen(PORT, function () {
        console.log("Express listening on " + PORT + " !");
    })
})

