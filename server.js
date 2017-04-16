var express     = require("express");

// route yazildiginda POST ile gelen JSON requestlerini parse edip almak için kullanabileceğimiz module..
var bodyParser  = require("body-parser");
var app         = express();
var PORT        = process.env.PORT || 3000;

// underscore modülü array üzerinde istediğimiz gibi sorgulama gibi işlemleri yapmamıza olanak sağlar..
// underscorejs.org üzerinden daha fazla bilgiye erişilebilinir..
var _           = require("underscore");

var todos = [];
var todoNextId = 1;

// JSON request geldiğinde express bunu bodyParser sayesinde alıp parse edebilir..
// bunun için middleware ile yaptığımız gibi app.use() metodunu kullanıyoruz..
app.use(bodyParser.json());

// GET /todos
app.get("/todos", function(req, res){
    res.json(todos);
})

// GET /todos/:id
app.get("/todos/:id", function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id : todoId});

/*
    todos.forEach(function(todo){
        if(todoId === todo.id){
            matchedTodo = todo;
        }
    });
*/

    if(matchedTodo){
        res.json(matchedTodo);
    }else{
        // Eğer herhangi bir kayıt bulunamazsa 404 durumunu gönder..
        res.status(404).send();
    }

    //res.send("Asking todo with id of " + req.params.id);
})

// POST /todos
app.post("/todos", function(req, res){
    //body ile gelen verileri almak için bodyParser kullanıyoruz..

    // underscore içerisindeki pick() metodunun amacı gelen object içerisindeki istenilen 
    // alanları alıp yeni bir object oluşturmasıdır.
    // bize post ile gelen JSON objesinde description ve completed haricinde bir alan istemediğimiz için
    // pick() metoduyla diğer alanları eliyoruz..
    var body = _.pick(req.body, "description", "completed");

    // Validation
    // Gelen istekteki verilerin boolean, string veya description alanında bir verinin yazıp yazmadığını kontrol ettik.
    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
        // 400 kodu anlamı : İstenilen veriler sağlanmadığı için 400 kodu ile geri döndürüyoruz cevabı..
        return res.status(400).send();
    }

    body.description = body.description.trim();

    body.id = todoNextId++;

    todos.push(body);

    console.log("Todo added " + body);

    res.json(body);

})

app.listen(PORT, function(){
    console.log("Express listening on " + PORT + " !");
})