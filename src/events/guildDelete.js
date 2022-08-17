const { EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
	name: 'guildDelete',
	once: false,

	execute: async (guild, client) => {
		if (!guild || !guild?.available) return false;

		const ownerId = guild?.ownerId;
		const user = ownerId ? await client.users.fetch(ownerId) : null;
        const owner = user ? user.username : ownerId;

		const avatarURL = guild?.iconURL() ? guild?.iconURL() : 'https://i.imgur.com/yLv2YVnh.jpg';
		const embed = new EmbedBuilder()
			.setColor('Red')
			.setTitle(`${client.user.username} - Left a Server!`)
			.addFields(
				{ name: 'Name', value: `${guild?.name}`, inline: true },
				{ name: 'ID', value: `${guild?.id}`, inline: true },
				{ name: 'Owner', value: `${owner || 'Unknown User'}`, inline: true },

				{ name: 'Member Count', value: `${guild?.memberCount} / ${guild.maximumMembers}`, inline: true },
				{ name: 'Created At', value: `${guild?.createdAt}`, inline: true },
				{ name: 'Location', value: `${guild?.preferredLocale || 'Unknown Location'}`, inline: true },
			)
			.setAuthor({ name: guild?.name, iconURL: avatarURL })
			.setFooter({ text: 'Filter keywords: Coin Flipper, guildDelete, Guild, Left, Delete' })
			.setTimestamp();

		const webhook = new WebhookClient({ url: process.env['DeveloperLogs'] });
		webhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] });
	},
};
