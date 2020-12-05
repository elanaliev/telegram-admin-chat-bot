const telegraf = require('telegraf').default;
const JRead = require('./JsonRead');
const token = JRead.ReadJson().getToken().token;

let bot = new telegraf(token);

const commands = {
    ban : (msg, id) => {
        replyAction(msg, (from) => {
            msg.kickChatMember((id === undefined) ? from.id : id);
        })
    },
    unban : (msg, id) => {
        replyAction(msg, (from) => {
            msg.unbanChatMember((id === undefined) ? from.id : id);
            msg.reply('Done!');
        })
    }
}
const keyboards = {
    admin : (from) => {
        return [[{text:'Ban', callback_data:`{"ban":${from.id}}`}, {text:'Unban', callback_data:`{"unban":${from.id}}`}]]       
    }
}

bot.use((msg, next) => {
    //Debug
    console.log(`Message from: ${msg.from.username} - Id: ${msg.from.id}`);
    next();
})

bot.command('admin', (msg) => {
    replyAction(msg, (from) => {
        // JsonRead text
        msg.reply(`Меню функций к пользователю ${(from.username === undefined) ? from.first_name : '@' + from.username}.\nЧто вы хотите сделать?`, CreateInlineKeyboard(keyboards.admin(from)).mark)
    })
}).on('callback_query', (msg) => {
    getAccess(msg, () => {
        let a = JSON.parse(msg.callbackQuery.data);
        let key = Object.keys(a)[0];
        commands[key](msg, a[key]);
        msg.deleteMessage();
    })
})

bot.command('ban', (msg) => commands.ban(msg));
bot.command('unban', (msg) => commands.unban(msg));

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

function replyAction(msg, action){
    getAccess(msg, () => {
        let from = (msg.message === undefined) ? msg.from : msg.message.reply_to_message.from;
        if(from.is_bot === false){
            action(from);
        }   
    });
}

function CreateInlineKeyboard(buttons){
    let keyboard = {inline_keyboard: buttons}
    return {
        unmark:keyboard,
        mark: {reply_markup: keyboard}
    }
}