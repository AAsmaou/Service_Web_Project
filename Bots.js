const Bot = require("./Bot.js");
const bots = require("./bots.json");


class Bots{
  constructor(){
    this.bots = new Map();
    bots.forEach((item, index, array) => {
      let newBot = new Bot(item);
      this.bots.set(newBot.name,newBot);
    });
  }
  get size(){
    return this.bots.size;
  }
  addBot(bot){
    let newBot = new Bot(bot);
    console.log("addBot :"+JSON.stringify(newBot));
    this.bots.set(newBot.name,newBot);
    return this.getBot(newBot.name);
  }
  getBot(name){
    this.bots.forEach(logMapElements);
    console.log(typeof name);
    console.log("getting bot with name "+name+" : "+JSON.stringify(this.bots.get(name)));
    return this.bots.get(name);
  }
  deleteBot(name){
    this.bots.forEach(logMapElements);
    let bot = this.bots.get(name);
	console.log("bot :"+JSON.stringify(bot));
    if(undefined!=bot){
      this.bots.delete(name);
      return name;
    } else {
      return undefined;
    }
  }
  updateBot(bot){
    const test = this.bots.has(bot.name);
    if(test){
      this.bots.set(bot.name,bot);
      return bot;
    } else {
      return undefined;
    }
  }
  getBots(){
    let tabBots = [];
    for (const v of this.bots.values()) {
      tabBots.push(v);
    }
    return tabBots;
  }
  deleteBots(){
    this.bots.clear();
  }

}

function logMapElements(value, key, map) {
  console.log("m["+key+"] = "+JSON.stringify(value));
}


module.exports = Bots;
