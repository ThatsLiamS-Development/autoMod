const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, WebhookClient } = require('discord.js');

module.exports = {
	name: 'report',
	description: 'Report a bug/issue to the developers!',
	usage: '<detailed description>',

	permissions: [],
	ownerOnly: false,
	guildOnly: true,

	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report a bug/issue to the developers!')
		.addStringOption(option => option
			.setName('description')
			.setDescription('Explain the issue you are having')
			.setRequired(true),
		),

	error: false,
	execute: ({ interaction, client }) => {

		const avatarURL = interaction.guild.iconURL() ? interaction.guild.iconURL() : 'https://i.imgur.com/yLv2YVnh.jpg';
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setDescription(`**${client.user.tag}**\n${interaction.options.getString('description')}`)
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
			.setFooter({ text: `ID: ${interaction.member.id}` })
			.setTimestamp();

		const webhook = new WebhookClient({ url: process.env['ReportWebhook'] });
		webhook.send({ username: interaction.guild.name, avatarURL, embeds: [embed] });

		interaction.followUp({ content: 'Thank you for helping us make autoMod even better.', ephemeral: true });
	},
};
