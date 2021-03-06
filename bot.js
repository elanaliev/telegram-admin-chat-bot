const telegraf = require('telegraf').default;
const data = require('./Data');
const token = data.Read().getToken().token;

let bot = new telegraf(token);

//#region 
const commands = {
    ban : (msg, id) => {
        replyAction(msg, (from) => {
            msg.kickChatMember((id === undefined) ? from.id : id);
            msg.deleteMessage();
            msg.reply('User banned.', CreateInlineKeyboard([[{text:'Unban', callback_data:`{"unban":${id}}`}]]).mark);
        })
    },
    unban : (msg, id) => {
        replyAction(msg, (from) => {
            msg.unbanChatMember((id === undefined) ? from.id : id);
            msg.reply('Done!');
            msg.deleteMessage();
        })
    },
    cancel: (msg) => {
        msg.deleteMessage(); //{"cancel":"${msg}"}
    }
}

const keyboards = {
    admin : (from) => {
        return [[{text:'Ban', callback_data:`{"ban":${from.id}}`}, {text:'Kick', callback_data:`{"unban":${from.id}}`}]]       
    }
}
//#endregion

bot.use((msg, next) => {
    console.log(`Message from: ${msg.from.username} - Id: ${msg.from.id}`);
        next();    
})

bot.on('text', (msg, next) => {
    let user = (msg.from.username !== undefined) ? '@' + msg.from.username : msg.from.first_name;
    let word = RegExp(data.Read().getChatConfig(msg.chat.id).fbdwords.join('|'),'g');
    if(word.toString() != '/(?:)/g'){
        let mtext = msg.message.text.toLowerCase();
        if(mtext.replace(/ /g,'').match(word)){
            msg.deleteMessage();
            let symbol = '...';
            let text = (`<b>Вы написали:</b> <i>${mtext.replace(/ /g, '').replace(word, symbol)}</i>`);
            console.log(text);
            msg.replyWithHTML(`${user}, ваше сообщение содержало запрещенное слово и было удалено.\n${text}`);
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
        let a = JSON.parse(msg.callbackQuery.data);
        let key = Object.keys(a)[0];
        commands[key](msg, a[key]);
    })
})

bot.command('del', (msg) => {
    getAccess(msg, ()=>{
        msg.deleteMessage();
        msg.deleteMessage(msg.message.reply_to_message.message_id);
    })
})

bot.command('addfwords', (msg) => {
    getAccess(msg, () => {
        let id = msg.chat.id;
        let fbd = [];
        msg.message.text.replace('/addfwords', '').replace(/ /g, '').match(/.*?\;/g).forEach(element => fbd.push(element.replace(';', '')));
        console.log(fbd);
        data.Write(id, {atr:'fbdwords', val:fbd});
    })    
})

bot.command('ban', (msg) => commands.ban(msg));
bot.command('unban', (msg) => commands.unban(msg));

bot.launch();

//#region 
function getAccess(msg, action){
    msg.getChatMember(msg.from.id).then((result) => {
        if(result.status == 'creator' || result.status == 'administrator'){
            action();
        }
        else console.log('no access');
    })
}

function replyAction(msg, action){
    getAccess(msg, () => {
        let from = (msg.message === undefined) ? msg.from : msg.message.reply_to_message.from;
        console.log(from);
        if(from.is_bot === false){
            action(from);
        }   
        else {
            msg.reply(`Пользователь @${from.username} с id: ${from.id} является ботом.`);
            msg.deleteMessage();
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
//#endregion