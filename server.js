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
// GET /todos/:id

app.get("/todos", function(req, res){
    res.json(todos);
})

app.listen(PORT, function(){
    console.log("Express listening on " + PORT + " !");
})