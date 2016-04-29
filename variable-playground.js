var person = {
   name: 'adam',
   age: 21 
}; 

function updatePerson (obj) {
//    obj = {
 //       name: 'jimmy',
 //       age: 25
        
 //   }
 obj.age = 25;
    
}
updatePerson(person);
console.log(person);

// Array example
var array = [1,2];

function updateArray (obj) {
    
    obj.push(3);
   
}

updateArray(array);
console.log(JSON.stringify(array));
