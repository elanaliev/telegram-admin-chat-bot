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
    console.log(`Message from: ${msg.from.username}\nId: ${msg.from.id}\nMessage: ${msg.message.text}`);
    msg.reply(msg.message);
    next();
})


bot.launch();

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