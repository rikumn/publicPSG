let time_left = document.querySelector('strong')
let versionDE = '0.0.3'

async function Gameloaded(game){
    let version_ = await GAME.getGameVersion()
    version_ = version_[0].split(' ')[2];
    if (version_ == versionDE)
    {
        if (await game.CanBuy()){
            location.replace('ingredients.html')
        }
        else if (await game.CanMake()){
            location.replace('potions.html')
        }
        else if (await game.CanSell()){
            location.replace('plaza.html')
        }
    }
    else{
        document.getElementById('refresh').setAttribute('open',null);
    }
}