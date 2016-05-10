var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

// middleware
app.use(bodyParser.json());

// routes
app.get('/', function (req, res) {
    res.send('Todo API root');
});

// get all 
// ? completed = true
// ? q = searchstring
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;
    
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed : true});
    }  else if (queryParams.hasOwnProperty('completed') &&  queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed : false});
    };
    
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLowerCase.indexOf(queryParams.q.toLowerCase) > -1;
        }
        );
    }
    res.json(filteredTodos);
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
    
    db.todo.create(body)
    .then(function (todo) {
        res.json(todo.toJSON());
    } ).catch(function (e){
        res.status(400).json(e);
    })
    /* 
    body.id = todoNextId++;
    body.description = body.description.trim();
    todos.push(body);
    res.json(body); 
    */
  

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

db.sequelize.sync({
    force : false}).then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port + ' + PORT);
    });   
});

function getTodoById(id) {
    return new Promise(function (resolve, reject) {
        var todo;
           
        todo = _.findWhere(todos,{id: id});
        if (todo) {
            resolve(todo);
        }
        else { 
            reject('Id ' + id + ' Not found'); 
        };
    })
}

