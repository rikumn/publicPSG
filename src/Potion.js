export default class Potion{
    constructor(_tittle, _ingredients,_game,_desc ="",_description="", _type ="",tagactive = false){
        this.game = _game;
        this.tittle = _tittle;
        this.ID = _game.index_potion++;
        this.ingredients = _ingredients;
        this.desc = _desc;
        this.description = _description;
        this.type = _type;
        this.tag = tagactive;
    }
}