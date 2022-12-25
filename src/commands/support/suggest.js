const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
	name: 'suggest',
	description: 'Suggest an improvement, command or feature!',
	usage: '`/suggest <detailed description>`',

	permissions: [],
	ownerOnly: false,
	guildOnly: true,

	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest an improvement, command or feature!')
		.setDMPermission(false)

		.addStringOption(option => option
			.setName('description').setDescription('Include a detailed description of your suggestion').setRequired(true),
		),

	cooldown: { time: 10 * 60, text: '10 minutes' },
	error: false,
	execute: ({ interaction, client }) => {

		const avatarURL = interaction.guild.iconURL() ? interaction.guild.iconURL() : 'https://i.imgur.com/yLv2YVnh.jpg';
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setDescription(`**${client.user.tag}**\n${interaction.options.getString('description')}`)
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
			.setFooter({ text: `ID: ${interaction.member.id}` })
			.setTimestamp();

		const webhook = new WebhookClient({ url: process.env['SuggestionWebhook'] });
		webhook.send({ username: interaction.guild.name, avatarURL, embeds: [embed] });

		interaction.followUp({ content: 'Your suggestion has been sent to my developers.', ephemeral: true });
	},
};
