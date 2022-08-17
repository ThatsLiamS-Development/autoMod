const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const makeGrid = require('../../utils/makeGrid');

module.exports = {
	name: 'about',
	description: 'Shows lots of cool information about the bot!',
	usage: '`/about`',

	permissions: [],
	ownerOnly: false,
	guildOnly: true,

	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Shows lots of cool information about the bot!')
		.setDMPermission(false),

	error: false,
	execute: async ({ interaction, client }) => {

		const promises = [
			client.shard.fetchClientValues('ws.ping'),
			client.shard.fetchClientValues('guilds.cache.size'),
			client.shard.broadcastEval(() => this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
		];
		const results = await Promise.all(promises);

		const embed = new EmbedBuilder()
			.setTitle('My Information')
			.setColor('Green')
			.setDescription('Hey, I\'m **[autoMod#3828](https://automod.liamskinner.com/invite)**!\n```\n' + makeGrid(results) + '```')
			.addFields(
				{ name: '**Total Servers:**', value: results[1].reduce((acc, guildCount) => acc + guildCount, 0).toString(), inline: true },
				{ name: '**Total Users:**', value: results[2].reduce((acc, memberCount) => acc + memberCount, 0).toString(), inline: true },
				{ name: '**Total Commands:**', value: '19', inline: true },

				{ name: '**Uptime:**', value: `\`${Math.floor(client.uptime / 86400000)}d ${Math.floor(client.uptime / 3600000) % 24}h ${Math.floor(client.uptime / 60000) % 60}m ${Math.floor(client.uptime / 1000) % 60}s\``, inline: true },
				{ name: '**Shard ID:**', value: `\`#${Number(interaction.guild.shardId) + 1} out of ${client.shard.count}\``, inline: true },
				{ name: '**Developer:**', value: '**[ThatsLiamS#6950](https://liamskinner.co.uk)**', inline: true },
			)
			.setFooter({ text: 'Do /help to get started.' });

		interaction.followUp({ embeds: [embed] });

	},
};
