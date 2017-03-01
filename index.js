var 	nconf = require('nconf')
nconf.argv().env().file({ file: 'config.json' })
var	TelegramBot = require('node-telegram-bot-api'),
	moment = require('moment-timezone'),
	GC = require('public-google-calendar'),
	gc = new GC({
		calendarId: nconf.get('calid')
	}),
	token = nconf.get('token'),
	bot = new TelegramBot(token, { polling: true })

bot.onText(/\/taksi ?(.*)/, (msg, match) => {
	gc.getEvents({ earliestFirst: true }, (err, events) => {
		if (err) {
			return console.log(err.message)
		}
		var now = moment()
		var event
		events.some((e) => {
			e.start = moment(e.start)
			e.end = moment(e.end)
			if((e.start < now && e.end > now) || e.start > now) {
				e.now = (e.start < now)
				return event = e
			}
		})
		console.log(event)
		if (!event) {
			bot.sendMessage(msg.chat.id, 'Ei löytynyt vuoroja :(')
			return
		}
		if (event.now) {
			var shift = event.start.tz('Europe/Helsinki').format('H:mm')+'—'+event.end.tz('Europe/Helsinki').format('H:mm')
			bot.sendMessage(msg.chat.id, '👍 TaksiJulle *on vuorossa* ('+shift+'), soita heti 😉 045 7875 6969 🍆', { parse_mode: 'Markdown' })
		} else {
			var shift = event.start.tz('Europe/Helsinki').format('D.M. H:mm')+'—'+event.end.tz('Europe/Helsinki').format('H:mm')
			bot.sendMessage(msg.chat.id, '👎 TaksiJulle *ei ole vuorossa* (seuraava vuoro '+shift+')', { parse_mode: 'Markdown' })
		}
	})
})

bot.onText(/\/numero(.*)/, (msg, match) => {
	bot.sendContact(msg.chat.id, '+3584578756969', 'TaksiJulle')
})

bot.onText(/(.*)/, (msg, match) => {
	console.log(msg)
})
