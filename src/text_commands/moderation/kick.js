const Discord = require('discord.js');

const mention = require(`${__dirname}/../../util/mention`);
const send = require(`${__dirname}/../../util/send`);

module.exports = {
	name: 'kick',
	description: "Temporarily removes a member from the server!\nNote: They can rejoin if they have a invite code",
	usage: '<@member / id> [reason]',
	permissions: ["Kick Members"],
	aliases: ["k"],
	arguments: 1,
	async execute(message, args, prefix, client, firestore) {

		let errorMessage = false;

		let user = await mention.getUser(client, args[0]);
		if(!user) {
			try { user = await client.users.fetch(args[0]); }
			catch(error) { errorMessage = true; }
		}
		if (!user || errorMessage == true) {
			await send.sendChannel({ channel: message.channel, author: message.author }, { content: `Incorrect usage, make sure it follows the format: \`${prefix}kick <@member> [reason]\`` });
			return;
		}
		const member = message.guild.members.cache.get(user.id);
		if(member) {
			if(member.id == message.author.id) {
				await send.error({ name: `CommonSense`, message: `Cannot Kick Yourself` }, message.channel, `I am unable to kick ${user.tag}`);
				return;
			}

			let reason = args[1] ? args.slice(1).join(" ") : "No reason specified";
			if(reason.length > 1024) {
				await send.sendChannel({ channel: message.channel, author: message.author }, { content: `The reason specified was too long. Please keep reasons under 1024 characters` });
				return;
			}
			reason = Discord.Util.cleanContent(reason, message);

			const db = await firestore.collection(`servers`).doc(`${message.guild.id}`).get();
			const data = db.data();

			const logsChannel = client.channels.cache.get(data.logs.channel);
			let description = `${user.tag} (${user.id}) has been kicked from the server.\nThis been logged in ${logsChannel}`;

			const sendToUser = new Discord.MessageEmbed()
				.setAuthor(`${message.member.user.tag}`, `${message.member.user.displayAvatarURL()}`)
				.setTitle(`🔨 You have been Kicked from ${message.guild.name}`)
				.setColor('#DC143C')
				.addFields(
					{ name: '**Moderator**', value: `${message.author.tag} - ${message.author.id}`, inline: false },
					{ name: '**Reason**', value: `${reason}`, inline: false },
				)
				.setTimestamp();

			const userMessage = await send.sendUser(user, { embeds: [sendToUser] });
			if(!userMessage) { description += '\n\nI was unable to contact the target member.'; }

			const logs = new Discord.MessageEmbed()
				.setAuthor(`${message.member.user.tag}`, `${message.member.user.displayAvatarURL()}`)
				.setTitle(`🔨 Banned - ${user.tag}`)
				.setColor('#DC143C')
				.addFields(
					{ name: '**User**', value: `${user.tag} - ${user.id}`, inline: false },
					{ name: '**Moderator**', value: `${message.author.tag} - ${message.author.id}`, inline: false },
					{ name: '**Reason**', value: `${reason}`, inline: false },
				)
				.setTimestamp();

			const server = new Discord.MessageEmbed()
				.setAuthor(`${message.member.user.tag}`, `${message.member.user.displayAvatarURL()}`)
				.setTitle(`🔨 Banned - ${user.tag}`)
				.setColor('#DC143C')
				.setDescription(description)
				.setTimestamp();

			member.kick(`Moderator: ${message.author.tag} - reason: ${reason}`).catch(async (err) => {

				await send.error(err, message.channel, `I am unable to kick ${user.tag}`);
				return;

			});

			if(logsChannel && message.channel.id == logsChannel.id) {
				await send.sendChannel({ channel: message.channel, author: message.author }, { embeds: [logs] });
			}
			else if(logsChannel) {
				await send.sendChannel({ channel: message.channel, author: message.author }, { embeds: [server] });
				await send.sendChannel({ channel: logsChannel, author: message.author }, { embeds: [logs] });
			}
			else {
				await send.sendChannel({ channel: logsChannel, author: message.author }, { embeds: [logs] });
			}

		}
		else {
			await send.sendChannel({ channel: message.channel, author: message.author }, { content: `Incorrect usage, make sure it follows the format: \`${prefix}kick <@member> [reason]\`` });
		}
	}
};