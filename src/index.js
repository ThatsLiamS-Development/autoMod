/* Import required modules and files */
require('dotenv').config();
const { ShardingManager } = require('discord.js');
const express = require('express');

/* Create an express webpage */
const app = express();
app.get('/', (_req, res) => res.send('Hello World!'));
const time = new Date();
app.listen(3000, () => console.log(`Last restart: ${time.getHours()}:${time.getMinutes()}, ${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()} UTC`));

/* Shard the bot */
const manager = new ShardingManager('./src/bot.js', {
	totalShards: 'auto',
	token: process.env['BotToken'],
	respawn: true,
});

manager.spawn({
	amount: manager.totalShards,
	delay: 500,
	timeout: -1,
});

manager.on('shardCreate', (shard) => {
	console.log(`Launched shard ${shard.id + 1}/${manager.totalShards}`);
});
