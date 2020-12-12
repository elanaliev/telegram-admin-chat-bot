const fs = require('fs');
let _json;

module.exports.Read = function(path = 'config.json'){
    if(_json === undefined || _json === null){ 
        _json = JSON.parse(fs.readFileSync(path));
    }
    return{
        getToken:() => {
            return{
                token:_json.token
            } 
        },
        getChatConfig:(id)=>{
            return _json[id];
        }
        /* Something else */
    }
}

module.exports.Write = function(id, value, path = 'config.json'){
    this.Read();
    _json[id][value.atr] = value.val;
    console.log(_json[id]);
    console.log(value);
    fs.writeFileSync(path, JSON.stringify(_json));
}



