const fs = require('fs');
let _json;

module.exports.ReadJson = function(path = 'info.json'){
    if(_json === undefined || _json === null){ 
        _json = JSON.parse(fs.readFileSync(path));
    }
    return{
        getToken:() => {
            return{
                token:_json.token
            } 
        },
        getChat:(globalChatId) => {
            if(globalChatId !== undefined && globalChatId !== null){
                return _json.chats.globalChatId;
            }
            else return undefined;
        }
    }
}



