var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API root');
});

// get all
app.get('/todos', function (req, res) {
    res.json(todos);
});

// get by id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id,10);
    console.log('got id :' + todoId);

    getTodoById(todoId).then(
        function (todo) {
            res.json(todo);
            },
        function (error) {
            //not found
            console.log('error: ' + error );
            res.status(404).send();
            }
     );

});

// post new todo
app.post('/todos', function(req, res){
    var body = req.body;
    body.id=todoNextId++;
    todos.push(body);
    res.json(body); 
});

app.listen(PORT, function () {
    console.log('Express listening on port + ' + PORT);
})

function getTodoById(id) {
    return new Promise(function (resolve, reject) {
        var todo;
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                todo = todos[i];
                break;
            }
        };
        if (todo) {
            resolve(todo);
        }
        else { 
            reject('Id ' + id + ' Not found'); 
        };
    })
}

