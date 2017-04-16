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


    // URL den query alıp 
    // Array içerisindeki objeleri sorgulamak istersek
    // bunun için underscore içerisindeki where() metodundan faydalanabiliriz..

    // URL' deki query yi almak için request ile gelen query property sini kullanabiliriz
    // bu bize bir object döndürür..

    var queryParameters = req.query;
    var filteredTodos   = todos;

    // Sorgulama yapabilmek için completed isimli alanın olup olmadığını kontrol ediyoruz..
    if(queryParameters.hasOwnProperty("completed") && queryParameters.completed === "true"){
        // eğer completed varsa ve true ise bir object olusturup onu sorguluyoruz..
        filteredTodos = _.where(filteredTodos, {completed : true});
    }else if (queryParameters.hasOwnProperty("completed") && queryParameters.completed === "false"){
        // eğer completed varsa ve false ise bir object olusturup onu sorguluyoruz..
        filteredTodos = _.where(filteredTodos, {completed : false});
    }

    res.json(filteredTodos);
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

// DELETE /todos/:id

app.delete("/todos/:id", function(req, res){

    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id : todoId});

    if(matchedTodo){
        todos = _.without(todos, matchedTodo);
        console.log("Silme işlemi başarılıdır!!");
        res.json(matchedTodo);
    }else{
        //return res.status(404).send();
        return res.status(404).json({"error" : "no matched record!!"});
    }

})

// PUT /todos/:id

app.put("/todos/:id", function(req, res){

    var todoId = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos, {id : todoId});

    var body = _.pick(req.body, "description", "completed");
    var validAttributes = {};

    if(!matchedTodo){
        return res.status(404).send();
    }

    // Eğer completed alanı JSON içerisinde gelmişse ve türü boolean ise
    // yeni değeri geçici olarak tutulan object içerisine aktar..
    if(body.hasOwnProperty("completed") && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    }else if (body.hasOwnProperty("completed")){
        // Eğer completed alanı JSON içerisinde gelmişse ve türü boolean değilse hata göster...
        return res.status(400).send();
    }

    // Eğer description alanı JSON içerisinde gelmişse, türü string ve karakter uzunluğu 0 dan büyükse;
    // yeni değeri geçici olarak tutulan object içerisine aktar..
    if(body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    }else if (body.hasOwnProperty("description")){
        // Eğer description alanı JSON içerisinde gelmişse ve türü boolean değilse hata göster...
        return res.status(400).send();
    }

    // extend metodu ile bir object içerisindeki değeri değiştirebiliriz..
     _.extend(matchedTodo, validAttributes);

    res.json(matchedTodo);

})

app.listen(PORT, function(){
    console.log("Express listening on " + PORT + " !");
})