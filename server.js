var express = require("express");
var app     = express();
var PORT    = process.env.PORT || 3000;

var todos = [{
    id : 1,
    description : "NMX Site Table..",
    complete : true
},{
    id : 2,
    description : "Nargile İç",
    complete : false
},{
    id : 3,
    description : "Kungfuya git",
    complete : false
}];

app.get("/", function(req, res){
    res.send("Todo API Root");
})

// GET /todos
app.get("/todos", function(req, res){
    res.json(todos);
})

// GET /todos/:id
app.get("/todos/:id", function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo;

    todos.forEach(function(todo){
        if(todoId === todo.id){
            matchedTodo = todo;
        }
    });

    if(matchedTodo){
        res.json(matchedTodo);
    }else{
        // Eğer herhangi bir kayıt bulunamazsa 404 durumunu gönder..
        res.status(404).send();
    }

    //res.send("Asking todo with id of " + req.params.id);
})

app.listen(PORT, function(){
    console.log("Express listening on " + PORT + " !");
})