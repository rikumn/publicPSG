function Gameloaded(game){
    game.user.ingredient_inventory.CreateUI();
    game.user.potion_inventory.CreateUI(1);
    ItemsClickable()
    SetDetailsPot(0)
    SetDetailsIngre(0)
}

function GameDataSet(){
    GAME.user.ingredient_inventory.UpdateUI();
    GAME.user.potion_inventory.UpdateUI(1);
    FillBoard();
}

let details = document.getElementsByClassName("details")

function ItemsClickable(){
    let itemingredients = document.getElementsByClassName("InventoryIngredient")
    for (let i = 0; i < itemingredients.length; i++) {
        const itemingredient = itemingredients[i];
        itemingredient.setAttribute("onclick","SetDetailsIngre("+i+")")
        itemingredient.setAttribute("data-q","-")
    }
    
    let itempotions = document.getElementsByClassName("InventoryPotion")
    for (let i = 0; i < itempotions.length; i++) {
        const itempotion = itempotions[i];
        itempotion.setAttribute("onclick","SetDetailsPot("+i+")")
    }
}

function SetDetailsIngre(index){
    let item = GAME.GLOBALITEMS[index];
    var image_name = item.tittle.toLowerCase().replaceAll(" ",'-').replace("'s","");
    //details[0].childNodes[1] -> img
    details[0].childNodes[1].setAttribute("src","assets/ingredients/i_"+ image_name +".png")
    //details[0].childNodes[3] -> text
    //details[0].childNodes[3].childNodes[1] -> tit
    details[0].childNodes[3].childNodes[1].innerHTML = item.tittle
    //details[0].childNodes[3].childNodes[3] -> paragraf 
    details[0].childNodes[3].childNodes[3].innerHTML = item.description
    //console.log(details[0].childNodes[3].childNodes)
}

function SetDetailsPot(index){
    let item = GAME.GLOBALPOTIONS[index];
    var name_image = item.tittle.toLowerCase().replaceAll(" ",'');
    //details[1].childNodes[1] -> img
    details[1].childNodes[1].setAttribute("src","assets/potions/p_basic_"+ name_image +".png")
    //details[1].childNodes[3] -> text
    //details[1].childNodes[3].childNodes[1] -> tit
    details[1].childNodes[3].childNodes[1].innerHTML = item.tittle
    //details[1].childNodes[3].childNodes[3] -> paragraf 
    details[1].childNodes[3].childNodes[3].innerHTML = item.description
    //details[1].childNodes[3].childNodes[7] -> lista 
    let ingredientas = ""
    for (let i = 0; i < item.ingredients.length; i++) {
        const element = item.ingredients[i];
        let ingr = GAME.GLOBALITEMS[element[0]];
        var image_name = ingr.tittle.toLowerCase().replaceAll(" ",'-').replace("'s","");
        ingredientas += '<li><span>'+element[1]+'</span> <span>'+ingr.tittle+'</span> <img src="assets/ingredients/i_'+ image_name +'.png" alt="item"></li>'
    }

    details[1].childNodes[3].childNodes[7].childNodes[3].innerHTML = `<ul class="r-ingredients">
    `+ingredientas+`
    </ul>`
    //console.log(details[1].childNodes[3].childNodes[7])
}

function FillBoard(page_index = 0){
    let board = document.getElementsByClassName("board big")[0]
    board.innerHTML = ""
//hacer que si page_index = 0 primeros 0 - 81 [a*81 - (a+1)*81] 
//hacer que si page_index = 1 primeros 81 - 162
    let max_per_page = 81
    for (let i = page_index * max_per_page; i < (page_index + 1) * max_per_page; i++) {
        if (GAME.user.potion_inventory.items_seq[i] == undefined) break
        const element = GAME.GLOBALPOTIONS[GAME.user.potion_inventory.items_seq[i]];
        let nam = "b_"
        nam += element.tittle[0].toLowerCase()
        nam += 5 == GAME.user.potion_inventory.items_seq[i] ? 's' :element.tittle.split(' ')[1][0]
        board.innerHTML += '<div class='+nam+'></div>'
    }
}