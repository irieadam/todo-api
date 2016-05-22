var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

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
app.get('/todos', middleware.requireAuthentication ,function (req, res) {
    var queryParams = req.query;
    var where = {};
    
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        where.completed = true; 
    } else if (queryParams.hasOwnProperty('completed') &&  queryParams.completed === 'false') {
        where.completed = false;
    };
    
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        where.description =  {
                $like : '%'+queryParams.q+'%'
        }; 
    } ;
    
   where.userId = req.user.id;
    
    db.todo.findAll({where : where}).then(function (todos) { 
        res.json(todos);
    }, function (e) {
        res.status(500).send()
    });
});

// get by id
app.get('/todos/:id', middleware.requireAuthentication , function (req, res) {
    var todoId = parseInt(req.params.id,10);
    console.log('got id :' + todoId);

   getTodoById(todoId,req.user.id).then(
        function (todo) {
            res.json(todo);
        },
        function (error) {
            //not found
            console.log('error: ' + error);
            if (error === '401') {res.status(401).send();}
                else {
                    res.status(404).send();
                };
        }
    ); 

});

// post new todo
app.post('/todos' , middleware.requireAuthentication , function(req, res){
    var body = _.pick(req.body,'description', 'completed') ;
    
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
        return res.status(400).send();
    } 
    
    db.todo.create(body)
    .then(function (todo) {
        req.user.addTodo(todo).then(function (todo) {
            return todo.reload();
        }).then(function () {
            res.json(todo.toJSON());
        });
        
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


app.delete('/todos/:id', middleware.requireAuthentication , function (req, res) {
     var todoId  = parseInt(req.params.id,10);
        db.todo.destroy({
            where : {
                id: todoId
            }
        }).then(function (rowsDeleted) {
             if (rowsDeleted === 0) {
                 res.status(404).json({
                     error : 'no todo found'
                 });
             } else {
                res.status(204).send();    
             }
        } ,function () {
            res.status(500).send();  
          }
     );  
});

app.put('/todos/:id', middleware.requireAuthentication , function (req, res) {
    var todoId  = parseInt(req.params.id,10);
    var body = _.pick(req.body,'description', 'completed') ;
    console.log(" Update object : " + JSON.stringify(body) + ' id ' + todoId);
    var attributes = {};
    
    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
        } 
    
    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    
    
     getTodoById(todoId,req.user.id).then(
        function (todo) {
            // update item
                if (todo) {
                    todo.update(attributes).then(function (todo) { 
                        res.json(todo.toJSON());
                        }, function (e) {
                            res.status(400).json(e);
                        });
                } 
            },
        function (error) {
            console.log('/');
             if (error === '401') {res.status(401).send();}
                else {
                    res.status(404).send();
                };
            }
     );
    
});


app.post('/users', function(req, res){
    var body = _.pick(req.body,'email', 'password') ;
    
    db.user.create(body).then(function (user) {
        res.json(user.toPublicJSON());
    } ).catch(function (e){
        res.status(400).json(e);
    })

});

app.post('/users/login', function(req, res){
    var body = _.pick(req.body,'email', 'password') ;
    
    db.user.authenticate(body).then(function (user){
        var token = user.generateToken('authentication');
        
        if (token) {
            res.header('Auth',token ).json(user.toPublicJSON());   
        } else {
             res.status(401).send();   
        }
    }, function(){
        res.status(401).send();     
    });
    
});


db.sequelize.sync({
    force : true}).then(function () {
            app.listen(PORT, function () {
                console.log('Express listening on port + ' + PORT);
            });   
});

function getTodoById(id,userId) {
    return new Promise(function (resolve, reject) {
       // var todo;
        
        db.todo.findById(id).then(function (todo){
            if(!!todo) {
                if (todo.userId === userId) {
                 resolve(todo);
                } else {
                    reject('401');
                }
            }
            else {
                reject('Id ' + id + ' Not found');
            }
        }, function(error){
            reject(error);
        });
    })
   
}

