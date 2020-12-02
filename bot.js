/*  
    !- Release v1.0 -!
    https://github.com/elanaliev/telegram-admin-chat-bot
    https://github.com/elanaliev
*/
const telegraf = require('telegraf').default;
const JRead = require('./JsonRead');
const token = JRead.ReadJson().getToken().token;

let bot = new telegraf(token);

bot.use((msg, next) => {
    console.log(`Message from: ${msg.from.username} - Id: ${msg.from.id}`);
    next();
})

bot.command('ban', (msg) => {
    replyAction(msg, (from) => {
        msg.reply('Ban ' + from.username);
        msg.kickChatMember(from.id);
    })
})

bot.command('unban', (msg) => {
    replyAction(msg, (from) => {
        msg.reply('Unban ' + from.username);
        msg.unbanChatMember(from.id);
    })
})

function replyAction(msg, action){
    getAccess(msg, () => {
        let unbanfrom = msg.message.reply_to_message.from; 
        if(unbanfrom.is_bot === false){
            action(unbanfrom);
        }   
    });
}



bot.launch();

function getAccess(msg, action){
    msg.getChatMember(msg.from.id).then((result) => {
        console.log(result.status);
        if(result.status == 'creator' || result.status == 'administrator'){
            action();
        }
        else console.log('no access');
    })
}

function CreateInlineKeyboard(buttons){
    let keyboard = {inline_keyboard: buttons}
    return {
        unmark:keyboard,
        mark: {reply_markup: keyboard}
    }
}

function ifNotNull(value, action, action2 = () => { console.log('Value is null'); }){
    if(value !== null && value !== undefined) {
       return action();
    } else {
       return action2();
    }
};