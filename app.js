var bugdetController=(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
        this.percentage=Math.round((this.value/totalIncome)*100);
        }
        else{
            this.percentage=-1;
        }
    };
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }

    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum=sum+cur.value;
        });
        data.totals[type]=sum;
    }
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:0
    };

    return{
        addItem:function(type,des,val){
            var newItem,ID;
            if(data.allItems[type].length>0){
            ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID=0;
            }
            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }
            else if(type==='inc'){
                newItem=new Income(ID,des,val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget:function(){
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget=data.totals.inc-data.totals.exp;
            if(data.totals.inc>0){
            data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);}
            else{
                data.percentage=-1;
            }
        },

        deleteItems:function(type,id){
            var ids,index;
            ids=data.allItems[type].map(function(current){
                return current.id;
            });

            index=ids.indexOf(id);

            if(index!==-1){
                data.allItems[type].splice(index,1);
            }

        },

        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;

        },

        getBudget:function(){
            return{
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage 
            };
        },

        testing:function(){
            console.log(data);
        }
    };

})();


var UIController=(function(){
   
    var DOMstring={
        inputType:'.add__type',
        inputDescripton:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        expenseContainer:'.expenses__list',
        incomeContainer:'.income__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentageLabel:'.item__percentage',
        dateLabel:'.budget__title--month'

    };
    
    var formatNumber=function(num,type){
        var numSplit,int,dec;

        num=Math.abs(num);
        num=num.toFixed(2);

        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3){
            int=int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);

        }

        dec=numSplit[1];
       
        return  (type==='exp'?'-':'+')+''+int+'.'+dec;
    };
    var nodeListForEach=function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
         }
    };


    return{
        
        getInput:function(){
            return{
                 type:document.querySelector(DOMstring.inputType).value,
                 description:document.querySelector(DOMstring.inputDescripton).value,
                 value:parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },

        getDOMstrings:function(){
        return DOMstring
         },


         addItem:function(obj,type){
             var html,newhtml,element;
             if(type==='inc'){
             element=DOMstring.incomeContainer;
            html= '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix">  <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div> '
             }

             else if(type==='exp'){
                 element=DOMstring.expenseContainer;
            html=  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
             }

             newhtml=html.replace('%id%',obj.id);
             newhtml=newhtml.replace('%description%',obj.description);
             newhtml=newhtml.replace('%value%',formatNumber(obj.value,type))    ;

             document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
             
             return newhtml;
            
            },

            clearInputs:function(){
                var fields ,fieldsArr;
                fields=document.querySelectorAll(DOMstring.inputDescripton + ',' +  DOMstring.inputValue);
                fieldsArr=Array.prototype.slice.call(fields);
                fieldsArr.forEach(function(current,index,array) {
                    current.value="";
                    fieldsArr[0].focus();
                });

            },

            deleteListItems:function(selectorID){
                var el=document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },

            displayBudget:function(obj){
                var type;
                obj.budget>0?type='inc':type='exp';
                document.querySelector(DOMstring.budgetLabel).textContent=formatNumber(obj.budget,type);
                document.querySelector(DOMstring.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
                document.querySelector(DOMstring.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
                if(obj.percentage>0){
                document.querySelector(DOMstring.percentageLabel).textContent=obj.percentage+'%';
                }
                else{
                    document.querySelector(DOMstring.percentageLabel).textContent='---';
                }
            },

            displayPercentages:function(percentages){
                var fields=document.querySelectorAll(DOMstring.expensesPercentageLabel);
                
                nodeListForEach(fields,function(current,index){
                    
                    if(percentages[index]>0){
                        current.textContent=percentages[index]+'%';
                    }
                    else{
                        current.textContent='---';
                    }
                });
            },

            displayDate:function(){
                var now,year,month,months;
                now=new Date();

                months=['January','February','March','April','May','June','July','August','September','October','November','December'];
                month=now.getMonth();

                year=now.getFullYear();
                document.querySelector(DOMstring.dateLabel).textContent=months[month]+' '+year;
            },
            changedType:function(){
                var fields=document.querySelectorAll(
                    DOMstring.inputType+','+
                    DOMstring.inputDescripton+','+
                    DOMstring.inputValue);

                nodeListForEach(fields,function(cur){
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstring.inputBtn).classList.toggle('red')
            }


         };


})();



var controller=(function(budgtCtrl,UICtrl){ 

    var setupEventListener=function(){
    var DOM=UICtrl.getDOMstrings();
     
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    document.addEventListener('keypress',function(event){
        if(event.keycode===13 || event.which===13){
          ctrlAddItem();
        }
    });
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItems);
    document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    };
    
    var updateBudget=function(){
      budgtCtrl.calculateBudget();  
      var budget=budgtCtrl.getBudget();
      UICtrl.displayBudget(budget);
    };

    var updatePercentage=function(){
        budgtCtrl.calculatePercentages();
        var percentges=budgtCtrl.getPercentages();
        UICtrl.displayPercentages(percentges);
    };

    ctrlDeleteItems=function(event){
        var itemID,splitId,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
        splitId=itemID.split('-');
        type=splitId[0];
        ID=parseInt(splitId[1]); 
        budgtCtrl.deleteItems(type,ID);
        UICtrl.deleteListItems(itemID);
        updateBudget();
        updatePercentage();
        }
    };

   var ctrlAddItem = function(event){
      
    var input,newItem;
   input=UICtrl.getInput();

   if(input.description!="" && !isNaN(input.value) && input.value>0){

   newItem=budgtCtrl.addItem(input.type,input.description,input.value);

   UIController.addItem(newItem,input.type);
   UIController.clearInputs();

   updateBudget();
   updatePercentage();
   }
   

};
    


    return{
        init:function(){
            UICtrl.displayBudget(  {
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });
            console.log("Application has started");
            UIController.displayDate();
            setupEventListener();
        }
    };
})(bugdetController,UIController);

controller.init();