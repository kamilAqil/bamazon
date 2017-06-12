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
        choices:['View Products','View Low Inventory','Update Inventory'],
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

