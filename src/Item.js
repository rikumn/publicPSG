//hola mundo
export default class Item{
    constructor(_tittle, _abilities,_game,_desc ="",_description=""){
        this.game = _game;
        this.tittle = _tittle;
        this.ID = _game.index_item++;
        this.abilities = _abilities;
        this.desc = _desc;
        this.description = _description;
    }
}
