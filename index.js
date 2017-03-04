var 	nconf = require('nconf')
nconf.argv().env().file({ file: 'config.json' })
var	TelegramBot = require('node-telegram-bot-api'),
	moment = require('moment-timezone'),
	token = nconf.get('token'),
	bot = new TelegramBot(token, { polling: true }),
	request = require('request'),
	apikey = nconf.get('apikey'),
	calid = nconf.get('calid')

bot.onText(/\/taksi ?(.*)/, (msg, match) => {
	request.get('https://www.googleapis.com/calendar/v3/calendars/'+calid+'/events?key='+apikey+'&singleEvents=true&orderBy=startTime', function (err, res, body) {
		if (err || res.statusCode != 200) {
			return console.log(err)
		}
		var events = JSON.parse(body)
		var now = moment()
		var event
		events.items.some((e) => {
			e.start = moment(e.start.dateTime)
			e.end = moment(e.end.dateTime)
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
			bot.sendMessage(msg.chat.id, '👍 @TaksiJulle *on vuorossa* ('+shift+'), soita heti 😉 045 7875 6969 🍆', { parse_mode: 'Markdown' })
		} else {
			var shift = event.start.tz('Europe/Helsinki').format('D.M. H:mm')+'—'+event.end.tz('Europe/Helsinki').format('H:mm')
			bot.sendMessage(msg.chat.id, '👎 @TaksiJulle *ei ole vuorossa* (seuraava vuoro '+shift+')', { parse_mode: 'Markdown' })
		}
	})
})

bot.onText(/\/numero(.*)/, (msg, match) => {
	bot.sendContact(msg.chat.id, '+3584578756969', 'TaksiJulle')
})

bot.onText(/\/start/, (msg, match) => {
	if (msg.chat.type == 'private') {
		bot.sendMessage(msg.chat.id, 'Olen @TaksiJulle:n botti. Kerron onko /taksi ajossa.')
		bot.sendContact(msg.chat.id, '+3584578756969', 'TaksiJulle')
	}
})

bot.onText(/(.*)/, (msg, match) => {
	console.log(msg)
	if (msg.text.match(/^[^\/].*/) && msg.chat.type == 'private') {
		bot.sendMessage(msg.chat.id, 'Älä minulle yritä jutella, olen botti. @TaksiJulle vastaa viesteihisi tai numerosta:')
		bot.sendContact(msg.chat.id, '+3584578756969', 'TaksiJulle')
	}
})
