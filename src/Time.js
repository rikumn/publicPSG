//New TIME
export default class Time{
    constructor(){
        this.timestamp = 0;
        this.interval = 0;
        this.daymax = 0;
        this.dayregistered = 0;
    }
    async initialize(){
        //let times = await window.GAME.GetTimes();
        //console.log(times);
        let nowtime = new Date().getTime()
        this.timestamp = nowtime;
        this.interval = 864000000;
        //this.daymax = new Date("2022-03-13").getTime() - 1//parseInt(times[2])+1;
        /*
        uint time = block.timestamp;
        uint dayregistered = dateRegisteredToOwner[_address];
        uint interval = _getIntervalReset();
        uint restoTime = time % interval;
        uint restoDayregistered = dayregistered % interval;
        uint dayspassed = (time - restoTime) - (dayregistered - restoDayregistered);
        */
        let resto = nowtime % 864000000;
        this.daymax = nowtime - resto + 864000000 -1000//parseInt(times[2])+1;
        this.dayregistered =  new Date("2022-03-13").getTime();//parseInt(times[3]);
        
        return this;
    }
    AddSecond(){
        this.timestamp+=1000;
    }
    AddDayIf()
    {
        if(0 >= (this.daymax - this.timestamp)){
            this.daymax += this.interval;
        }
    }
}