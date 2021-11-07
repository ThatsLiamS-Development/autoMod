const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello World!'));

const time = new Date();
app.listen(3000, () => console.log(`Last restart: ${time.getHours()}:${time.getMinutes()}, ${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()} UTC`));


const Discord = require('discord.js');
const client = new Discord.Client({
	intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_WEBHOOKS'],
	partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
});


const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env['Database'])) });
const firestore = admin.firestore();


const fs = require('fs');
const eventFiles = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`${__dirname}/events/${file}`);
	if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
	else client.on(event.name, (...args) => event.execute(...args, client, firestore));
}


client.login(process.env['BotToken']);
