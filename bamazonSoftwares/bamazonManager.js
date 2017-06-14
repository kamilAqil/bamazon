// install and packages 
var Table = require('cli-table');
var mysql = require('mysql');
var inquire = require('inquirer');
var async = require('async');
// connection variable
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'Sup3rk3y710',
    database : 'bamazon'
});

//start connection to mysql database
connection.connect();

dropDownOptions();
//addProductToTable();

//queryProductsTable();
//viewLowInventory();
//addToInventory();





// create a function to view the products for sale. 
function queryProductsTable(){

    var asyncTableQuery = new Promise(function(resolve,reject){
    // do a thing possibly async, then... 
        connection.query('SELECT * FROM products',function(error,results){
            if(error){
                console.log(error);
                reject(Error("it broke"));
            }
            //console.log('query worked');
            resolve(resultsToTable(results));
        });
    });
    return asyncTableQuery;
}


// create a function to view low inventory 
function viewLowInventory(){
    // query products table and return ids of products
    // with stock lower than 5 
    connection.query('SELECT * FROM products WHERE stock_quantity<=5',function(err,results){
        if(err) throw err;
        resultsToTable(results);
    });

    connection.end();

}


// create a function to add to inventory 
function addToInventory(){
    var whichOne = undefined;
    var howMany = undefined;
    var currentInventory = undefined;
    queryProductsTable().then(function(err,result){
        //console.log('now we do something else');
        inquire.prompt([{
            type:"input",
            message:"\nPlease enter the id of the\n"
                    +"item you would like to update",
            name:'inventoryQuestion'        
        }])
            .then(function(answers){
            whichOne =  answers.inventoryQuestion;  
            console.log(whichOne); 
            connection.query('SELECT * FROM products WHERE item_id=?',[parseInt(whichOne)],function(err,res){
               if(err){
                   console.log(err);
               }
                if(res==[]){
                    console.log("something went wrong");
                }
                currentInventory = res[0]['stock_quantity'];
                inquire.prompt([{
                    type: 'input',
                    message: 'How many would you like to add to '+res[0]['product_name'],
                    name:'howMany'

                }]).then(function(answers){
                    howMany = answers.howMany;
                    console.log(answers.howMany);
                    inquire.prompt([{
                        type:'list',
                        choices :['Yes','No'],
                        message:'Are you sure?',
                        name:'questionConfirm'
                    }]).then(function(answers){
                        console.log(answers.questionConfirm);
                        if(answers.questionConfirm=='Yes'){
                            var numberToUpdate = parseInt(currentInventory)+ parseInt(howMany);
                            connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?',[parseInt(numberToUpdate),whichOne],function(err,res){
                                if(err) throw err;
                                console.log('success');
                                connection.end();
                            });
                        }else{

                        }
                    });
                });

            });
        });
    });
   
}

// create a function to add a new product 

// create a prompt that does a drop down through all the options
function dropDownOptions(){
    inquire.prompt([{
        type:'list',
        choices:['View Products','View Low Inventory','Update Inventory','Add Product'],
        message:"Please pick from the following",
        name:'dropDownQuestion'
    }]).then(function(answers){
        console.log(answers.dropDownQuestion);
        switch(answers.dropDownQuestion){
            case 'View Products':
            queryProductsTable().then(function(err){
                connection.end();
            });
            break;
            case 'View Low Inventory':
            viewLowInventory();
            break;
            case 'Update Inventory':
            addToInventory();
            break;
            case 'Add Product':
            addProductToTable();
            break;
            default:
            console.log('something went wrong');
        }
    });
}

function resultsToTable(results){
    var table = new Table({
                    head : ['ID','Product Name','Department','Price','Stock/Quantity']
                });
            
        // loop through each object of results array 
            for(i=0;i<results.length;i++){
                // loop through each object value and push to temp array 
                var tempArray = [];

                for(var key in results[i]){
                tempArray.push(results[i][key]);
            }
            
                table.push(tempArray);
                
            }
         console.log(table.toString());
}

function addProductToTable(){
    var queryToGenerateListOfDepartments = new Promise(function(resolve,reject){
        var departmentList = [];
        //query the departments and return the array of departments
        connection.query('SELECT department_name FROM products',function(err,data){
            if(err){
                resolve(err);
            }
            //console.log(data);
            //loop through data array and get object[department_name]
            //and push it to the departmentList array then return 
            //department list array at the end of the function 
            for(i=0;i<data.length;i++){
                // console.log(data[i]['department_name']);
                // console.log(departmentList.indexOf(data[i]['department_name']));
                if(departmentList.indexOf(data[i]['department_name'])<0){
                    departmentList.push(data[i]['department_name']);
                }
                
            }
            resolve(departmentList);
        });
        departmentList = [];
    });
    
    // Everything will happen once the array of departments is added 
    // beacuse before we add a specific product we will have the manager
    // select a department from a dropdown list in the inquire dropdown prompt
    queryToGenerateListOfDepartments.then(function(arrayOfDepartments){
      inquire.prompt([{
          type:'list', 
          name:'q1', 
          message:'Please select the department in which you would like to create a product',
          'choices':arrayOfDepartments
      },
      {
          type:'input',
          message:'What is the name of the Product?',
          name:'q2'
      },
      {
          type:'input',
          message:'What is the Price?',
          name:'q3'
        },
      {
          type:'input',
          message:'How many in stock?',
           name:'q4',
      }]).then(function(ans){
        //console.log(ans);
        ans.q3 = parseInt(ans.q3);
        ans.q4 = parseInt(ans.q4);
        var productToAdd ={
            department:ans.q1.toString(),
            name:ans.q2.toString(),
            price:parseInt(ans.q3),
            stock:parseInt(ans.q4)
        };
        // console.log(typeof productToAdd.name);
        // console.log(typeof productToAdd.department);
        // console.log(typeof (productToAdd.price));
        // console.log(typeof productToAdd.stock);
            inquire.prompt([{
                type:'confirm',
                message:'Would you like to add '+productToAdd.name+" ?",
                name:'confirm'
            }]).then(function(answer){
                // console.log(answer.confirm == true);
                if(answer.confirm){
                    //add product to database
                    connection.query("INSERT into products SET ?",{product_name:productToAdd.name,department_name:productToAdd.department,price:productToAdd.price,stock_quantity:productToAdd.stock},function(err,results){
                                                                        if(err){
                                                                            throw err
                                                                            //console.log(err);
                                                                        }else{
                                                                            console.log('Success!');
                                                                        }
                                                                        

                    });
                }else{
                    console.log('Thank you come again');
                }
                connection.end();
            });
      });

        //End the connection to the database
        
        arrayOfDepartments = [];
    });
    
}

