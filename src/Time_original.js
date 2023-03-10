//Aparentemente descontinuado. Eliminar
/*export default class Time{
    constructor(){
        this.timestamp = 0;
        this.interval = 0;
        this.daymax = 0;
        this.dayregistered = 0;
    }
    async initialize(){
        let times = await window.GAME.GetTimes();
        //console.log(times);
        this.timestamp = times.timestamp*1000;
        this.interval = parseInt(times[1]);
        this.daymax = parseInt(times[2])+1;
        this.dayregistered = parseInt(times[3]);
        
        return this;
    }
    AddSecond(){
        this.timestamp+=1000;
    }
    AddDayIf()
    {
        if(0 >= (this.daymax - this.timestamp/1000)){
            this.daymax += this.interval;
        }
    }
}*/