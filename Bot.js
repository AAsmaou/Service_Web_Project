class Bot{
    constructor(bots){   //id,name,comment,tags
      if(undefined != bots.name) {
        this.name = bots.name;
      } else {
        this.name = "";
      }
    }
  }
  
  module.exports = Bot;
  