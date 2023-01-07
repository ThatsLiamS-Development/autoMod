// eslint-disable-next-line no-unused-vars
const { CommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, WebhookClient, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const format = (string) => string.split('\n').map((line) => '> ' + line).join('\n');

module.exports = {
	name: 'report',
	description: 'Report a bug/issue to the developers!',
	usage: '/report',

	permissions: [],
	ownerOnly: false,
	guildOnly: true,

	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report a bug/issue to the developers!')
		.setDMPermission(false),

	cooldown: { time: 10 * 60, text: '10 minutes' },
	defer: { defer: false, ephemeral: false },
	error: false,

	/**
	 * @async @function
	 * @author Liam Skinner <me@liamskinner.co.uk>
	 *
	 * @param {Object} arguments
	 * @param {CommandInteraction} arguments.interaction
	 * @param {Client} arguments.client
	 * @returns {Boolean}
	**/
	execute: async ({ interaction, client }) => {

		/* Create modal to display */
		const modalPopup = new ModalBuilder()
			.setCustomId(`report-${interaction.user.id}-${client.user.id}`).setTitle('autoMod\'s Bug Report!');

		/* Add input fields */
		const title = new ActionRowBuilder().addComponents(
			new TextInputBuilder().setCustomId('reportTitle').setLabel('Short title')
				.setStyle(TextInputStyle.Short).setMaxLength(150).setMinLength(5),
		);
		const description = new ActionRowBuilder().addComponents(
			new TextInputBuilder().setCustomId('reportDescription').setLabel('A clear and concise description')
				.setStyle(TextInputStyle.Paragraph).setMaxLength(2000).setMinLength(50),
		);
		const reproduce = new ActionRowBuilder().addComponents(
			new TextInputBuilder().setCustomId('reportReproduce').setLabel('Steps to reproduce the behavior')
				.setStyle(TextInputStyle.Paragraph).setMaxLength(2000).setMinLength(50)
				.setPlaceholder('1. Go to \'....\'\n2. Click on \'....\'\n3. Scroll down to \'....\''),
		);

		/* Display the modal */
		modalPopup.addComponents(title, description, reproduce);
		await interaction.showModal(modalPopup);

		/* Get the responses */
		const filter = (modal) => modal.customId === `report-${interaction.user.id}-${client.user.id}`;
		const res = interaction.awaitModalSubmit({ filter, time: 150_000 })
			.then(async (modal) => {

				await modal.deferReply({ ephemeral: true });

				const embed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle(`${modal.fields.getTextInputValue('reportTitle')}`)
					.setDescription(`**Description:**\n${format(modal.fields.getTextInputValue('reportDescription'))}\n\n**Steps to Reproduce:**\n${format(modal.fields.getTextInputValue('reportReproduce'))}`)
					.setAuthor({ name: modal.user.username, iconURL: modal.user.displayAvatarURL() })
					.setFooter({ text: `User ID: ${modal.member.id}` })
					.setTimestamp();

				/* Locate and send the webhook */
				const webhook = new WebhookClient({ url: process.env['ReportWebhook'] });
				webhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] });

				/* Returns true to enable the cooldown */
				modal.followUp({ content: 'Thank you for helping us make autoMod even better.', ephemeral: true });
				return true;

			})
			/* If they didn't response */
			.catch(async () => {
				await interaction.followUp({ content: 'Sorry, you took too long to repond.' });
				return false;
			});

		/* Returns boolean to enable the cooldown */
		return res;

	},
};
