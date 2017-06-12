// install and packages 
var Table = require('cli-table');
var mysql = require('mysql');
var inquire = require('inquirer');
var productIDForPurchase =[];
var idOfProductWanted = undefined;
var quantityWanted = undefined;
// connection variable
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'Sup3rk3y710',
    database : 'bamazon'
});


connection.connect();

queryProductsTable();
//inventoryCheck(idOfProductWanted);
  
//queryProductsTable();

// connection.end(function(err){
//     // prompt the user to select a product to purchase
//     // based on an entry by id
//     if(err) console.log(err);
// }); 






function queryProductsTable(){
    
    connection.query('SELECT * FROM products',function(error,results){
        if(error) throw error;
        //console.log('query worked');

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
                
                productIDForPurchase.push(parseInt(results[i]["item_id"]));
                
            }
         console.log(table.toString());
         //console.log(productIDForPurchase);
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
    // validate answers by checking against 
    // var productIDForPurchase =[];
        if (productIDForPurchase.indexOf(parseInt(answers.q))>-1){
            // console.log('Entry in array ');
            idOfProductWanted = parseInt(answers.q);
            inventoryCheck(idOfProductWanted);
        }else{
            console.log('\nEntry not in array, please restart\n'+
                        'the program and try again\n');
        }
    });
}

function inventoryCheck(id){
    // check inventory of item based on quantity 
    // requested and the id id 
    inquire.prompt([{
        type:"input",
        name:"q2",
        message:"How many would you like ?"
    }]).then(function(answers){
        connection.query('SELECT * FROM products WHERE item_id=?',[idOfProductWanted],function(err,results){
                if(err){
                    console.log(err);
                }
                //console.log(results);
                var inventory = results[0]['stock_quantity'];
                var itemPrice = results[0]['price'];
                var quantityWanted = answers.q2;
                console.log(typeof itemPrice);
                console.log(itemPrice);
                if(inventory>answers.q2){
                    console.log('\nitem is in stock\n');
                    // calculate total to deduct 
                    var totalCost = itemPrice * answers.q2;
                    console.log('\nYour Total is $'+totalCost+'\n');
                    confirmPurchase(quantityWanted,inventory,totalCost);
                }else{
                    console.log('\nthere are not enough in stock\n'+
                                'please restart program and try again\n');
                    connection.end(function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                }
            });
    });

}

function confirmPurchase(quantityWanted,inventory,totalCost){
    inquire.prompt([{
        type:'list',
        name:'q3',
        message:'Would you like to confirm this purchase?',
        choices:['Yes','No']

    }]).then(function(answers){
        // if the user selects yes then deduct inventory from 
        // product database
        if(answers.q3 == 'Yes'){
            // notify the user that the amount will be deducted
            // from their account
            
            // update product database by subtracting the quantityWanted
            // by the idOfProductWanted and then re setting the 
            // idOfProductWanted to undefinded and ending the connection
            var inventoryUpdateValue = inventory - quantityWanted;
            
            inventoryUpdateValue = inventoryUpdateValue.toFixed(2);
            connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?',[inventoryUpdateValue,idOfProductWanted],function(err,result){
                if(err) throw err;
                //console.log(result);
                console.log('\nsuccess');
                console.log('\nYou will be charged a total of $'+totalCost+"\n");
                //end sql connection 
                connection.end(function(error){
                    if(error) throw error;
                });
            });
            
            console.log(quantityWanted);

        }else{
            // else thank the user for using service 
            // and tell them to have a nice day and 
            // end the database connection
            console.log("\nThank you come again!\n");

            connection.end(function(error){
                if(error){
                    console.log(error);
                }
            });
        }
            
    });
}