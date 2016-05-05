var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': 'basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description : {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
    
})

sequelize.sync({force : false}).then(function () {
    console.log('Everything is synced');
    
    Todo.create({
        description: 'hump wife',

    }).then(function (todo) {
        return Todo.create({
            description: 'Clean office' 
        });
    }).then(function () {
       
       // return Todo.findById(1)
        return Todo.findAll({
            where: {
                description: {
                    $like: '%god%'
                }
            }
        })   
 }).then(function (todo)  {
        if(todo) {
            console.log(todo);
        } else {
            console.log('no todos foujd');
        }
    }).catch(function (e) {
        console.log(e);
    });
});


