const telegraf = require('telegraf').default;
const data = require('./Data');
const token = data.Read().getToken().token;

let bot = new telegraf(token);

const commands = {
    ban : (msg, id) => {
        replyAction(msg, (from) => {
            msg.kickChatMember((id === undefined) ? from.id : id);
            msg.deleteMessage();
        })
    },
    unban : (msg, id) => {
        replyAction(msg, (from) => {
            msg.unbanChatMember((id === undefined) ? from.id : id);
            msg.reply('Done!');
            msg.deleteMessage();
        })
    }
}

const keyboards = {
    admin : (from) => {
        return [[{text:'Ban', callback_data:`{"ban":${from.id}}`}, {text:'Kick', callback_data:`{"unban":${from.id}}`}]]       
    }
}

bot.use((msg, next) => {
    console.log(`Message from: ${msg.from.username} - Id: ${msg.from.id}`);
    next();
})

bot.on('text', (msg, next) => {
    let user = (msg.from.username !== undefined) ? '@' + msg.from.username : msg.from.first_name;
    let word = RegExp(data.Read().getChatConfig(msg.chat.id).fbdwords.join('|'));
    if(word.toString() != '/(?:)/'){
        if(msg.message.text.replace(/ /g,'').match(word)){
            msg.deleteMessage();
            msg.replyWithHTML(`${user}, ваше сообщение содержало запрещенное слово и было удалено.`);
        }
    }    
    next();
})

bot.command('admin', (msg) => {
    replyAction(msg, (from) => {
        msg.reply(`Меню функций к пользователю ${(from.username === undefined) ? from.first_name : '@' + from.username}.\nЧто вы хотите сделать?`, CreateInlineKeyboard(keyboards.admin(from)).mark)
    })
}).on('callback_query', (msg) => {
    getAccess(msg, () => {
        console.log(msg.callbackQuery.data);
        let a = JSON.parse(msg.callbackQuery.data);
        let key = Object.keys(a)[0];
        commands[key](msg, a[key]);
    })
})

bot.command('addfwords', (msg) => {
    getAccess(msg, () => {
        let id = msg.chat.id;
        let fbd = [];
        msg.message.text.replace('/addfwords ', '').match(/.*?\;/g).forEach(element => fbd.push(element.replace(';', '')));
        console.log(fbd);
        data.Write(id, {atr:'fbdwords', val:fbd});
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