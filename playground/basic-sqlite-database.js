var Sequelize = require("sequelize");
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect' : 'sqlite',
    'storage' : __dirname + '/basic-sqlite-database.sqlite'
});

// sequelize ile documentation 
// http://docs.sequelizejs.com/en/v3/

var Todo = sequelize.define('todo', {
    description : {
        type : Sequelize.STRING,
        allowNull : false, // bos birakilmamalidir..
        validate : {
            len : [1, 250] // karakter sayisi 1-250 arasında olmalıdır..
        }
    },
    completed : {
        type : Sequelize.BOOLEAN,
        allowNull : false, // bos birakilmamalidir..
        defaultValue : false // eger deger girilmezse false olarak belirle..
    }
});


sequelize.sync({
    // force: true // 
    // force egeer true olursa her defasında tabloyu siler ve yeniden olusturur
    // eger false olursa bir kere olusturur ve daha sonra varolan tablo üzerinden işlem yapar.
    // default => force: false 
}).then(function(){
    console.log("Everything is synced");

    Todo.findById(1).then(function(todo){

        if(todo){
            console.log(todo.toJSON());
        }else{
            console.log("Todo Bulunamadi!!!");
        }
        
    })

/*
    Todo.create({
        description : "Şirkete git",
//        completed: true // defaultValue : false tanimlandığı için comment out yaptık..
    }).then(function(todo){
        return Todo.create({
            description : "Yemeğe git",
            completed : true
        });
    }).then(function (){
        // return Todo.findById(1); // Tek bir kayit elde etmek için kullanabileceğimiz metod..
        return Todo.findAll({
            where : {
                // completed : false // direk değer atayabildiğimiz gibi like işlemi de yapabiliriz..
                description : {
                    $like : "%Yeme%"
                }
            }
        })
    }).then(function (todos){
        if(todos){
            todos.forEach(function(todo){
                console.log(todo.toJSON());
            })
        }else{
            console.log("no todo!!")
        }
    }).catch(function(error){
        console.log(error.message);
    })
*/
})
