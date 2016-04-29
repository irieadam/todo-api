var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
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
    var body = _.pick(req.body,'description', 'completed') ;
    
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
        return res.status(400).send();
    }  
    body.id = todoNextId++;
    body.description = body.description.trim();
    todos.push(body);
    res.json(body); 
});

app.delete('/todos/:id', function (req, res) {
     var todoId  = parseInt(req.params.id,10);
     
     getTodoById(todoId).then(
        function (todo) {
            //remove item
            todos = _.without(todos,todo);
            res.json(todo);
            },
        function (error) {
            //not found
            res.status(404).json(error);
            }
     );
    
});

app.put('/todos/:id', function (req, res) {
    var todoId  = parseInt(req.params.id,10);
    var body = _.pick(req.body,'description', 'completed') ;
    console.log(" Update object : " + JSON.stringify(body) + ' id ' + todoId);
    var validAttributes = {};
    
     getTodoById(todoId).then(
        function (todo) {
            // update item
          if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
                validAttributes.completed = body.completed;
            } else if (body.hasOwnProperty('completed')) {
                return res.status(400).send();
            } 
            
            if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
                validAttributes.description = body.description;
            } else if (body.hasOwnProperty('description')) {
                return res.status(400).send();
            } 
            
            console.log('Valid attributes: ' + JSON.stringify(validAttributes));
            
          //  todo.description = validAttributes.description;
          //  todo.completed = validAttributes.completed;
          // _.extend copies source object to new object, replacing exiting props  
            _.extend(todo,validAttributes);
            res.json(todo);
            },
        function (error) {
            //not found
            return res.status(404).json(error);
            }
     );
    
});


app.listen(PORT, function () {
    console.log('Express listening on port + ' + PORT);
})

function getTodoById(id) {
    return new Promise(function (resolve, reject) {
        var todo;
        
// for loop        
/*        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                todo = todos[i];
                break;
            }
        }; */
        
// where in underscore        
        todo = _.findWhere(todos,{id: id})
        if (todo) {
            resolve(todo);
        }
        else { 
            reject('Id ' + id + ' Not found'); 
        };
    })
}

