// install and packages 
var Table = require('cli-table');
var mysql = require('mysql');
var inquire = require('inquirer');
// connection variable
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'Sup3rk3y710',
    database : 'bamazon'
});
// on open display the table one time
showProductsTable();
// how many units would the client like to purchase

    // check to see if item in stock 

    // if not enough stock then notify client 

    // if there is enough product, update database 
    // inventory and show the customer the total cost



function showProductsTable(){
        connection.connect();
        connection.query('SELECT * FROM products',function(error,results){
            if(error) throw error;
            var productIDForPurchase =[];
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
                    // push item ids to array of ids avail for purchase
                    productIDForPurchase.push(results[i]["item_id"]);
                }
            console.log(table.toString());
            //console.log(productIDForPurchase);
        });
        connection.end(function(err){
            // prompt the user to select a product to purchase
            // based on an entry by id
            askQuestion();
        }); 
    }

function askQuestion(){
    inquire.prompt([{
        type: 'input',
        name:'q',
        message:'Please enter the ID of the product you would like to purchase.',
    }])
    .then(function(answers){
    console.log(answers.q);
    });
}