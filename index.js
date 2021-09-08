
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const { isArrayBufferView } = require('util/types');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}, at ${new Date()}.`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		console.log(interaction.options.getString('input'));
		console.log(interaction.options.getBoolean('test'));
		await interaction.reply('User info.');

	}

	if (commandName === 'homework') { 
		if (interaction.options.getSubcommand() === 'add') { 
			const fach = interaction.options.getString('fach')
			const aufgabe = interaction.options.getString('aufgabe')
			const jahr = interaction.options.getString('jahr')
			const monat = interaction.options.getString('monat')
			const tag = interaction.options.getInteger('tag')
			
			const inputs = {
				fach: fach,
				aufgabe: aufgabe,
				abgabe: interactionDataToDate(jahr, monat, tag)
			}

			const exampleEmbed = new MessageEmbed()
				.setColor('#ffffff')
				.setTitle(aufgabe)
				//.setURL('https://discord.js.org/')
				//.setAuthor('Aaron Eggert', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
				.setDescription(fach)
				//.setThumbnail('https://i.imgur.com/AfFp7pu.png')
				//.addFields(
				//	{ name: 'Regular field title', value: 'Some value here' },
				//	{ name: '\u200B', value: '\u200B' },
				//	{ name: 'Inline field title', value: 'Some value here', inline: true },
				//	{ name: 'Inline field title', value: 'Some value here', inline: true },
				//)
				//.addField('Inline field title', 'Some value here', true)
				//.setImage('https://i.imgur.com/AfFp7pu.png')
				.setTimestamp()
				.setFooter('@SchoolBot', '');

			const embed2 = new MessageEmbed()
				.setColor('#2ECC71')
				.setTitle("")
				.setDescription(':white_check_mark: Aufgabe wurde Erfolgreich hinzugefügt!');

			const embed1 = new MessageEmbed()
				.setColor('#1ABC9C')
				.setTitle('')
				.setDescription(`**Aufgabe**:	${inputs.aufgabe}\n**Fach**:	${inputs.fach}\n **Datum**:	${inputs.abgabe.getDate()}.${inputs.abgabe.getMonth()}.${inputs.abgabe.getFullYear()}\n`)

			await interaction.reply({embeds: [embed1, embed2]})
			var data  = fs.readFileSync('./data.json'),
    		json = JSON.parse(data)
			servers = json.Servers
			
			guildID = interaction.guildId
			
			console.log(guildID)
			

			// Letze  	versuchen das automatisch array erstellt wenn nicht vorhanden und eingetragen werden und sonst im vorhandenen array eintragen
					// servers[guildID] = ({fach:fach, aufgabe:aufgabe, tag:tag})

			

			fs.writeFileSync('./data.json', JSON.stringify(json, null, 4));

		}
	}


});

client.on('guildCreate', guild => {
	guild.systemChannel.send(`Hallo ich bin SchoolBot, danke fürs hinzufügen. \`\`\`\/help\`\`\` für eine Übersicht der Commands. \`\`\`\/setup\`\`\` um den Bot einzurichten.`)
});

client.login(token);


function interactionDataToDate(jahr, monat, tag) {
	var _tempJahr, _tempMonat;

	switch (jahr) {
		case 'year_2021':
			_tempJahr = 2021;
			break;
		case 'year_2022':
			_tempJahr = 2022;
			break;
		case 'year_2023':
			_tempJahr = 2023;
			break;
		case 'year_2024':
			_tempJahr = 2024;
			break;
		case 'year_2025':
			_tempJahr = 2025;
			break
		default:
			return 'Error: Invalid jahr'
	}

	switch (monat) {
		case 'month_jannuar':
			_tempMonat = 1;
			break;
		case 'month_februar':
			_tempMonat = 2;
			break;
		case 'month_märz':
			_tempMonat = 3;
			break;
		case 'month_april':
			_tempMonat = 4;
			break;
		case 'month_mai':
			_tempMonat = 5;
			break;
		case 'month_juni':
			_tempMonat = 6;
			break;
		case 'month_juli':
			_tempMonat = 7;
			break;
		case 'month_august': 
			_tempMonat = 8;
			break;
		case 'month_september':
			_tempMonat = 9;
			break;
		case 'month_oktober':
			_tempMonat = 10;
			break;
		case 'month_november': 
			_tempMonat = 11;
			break;
		case 'month_december':
			_tempMonat = 12;
			break;
		default:
			return 'Error: Invalid month';
	}

	if (tag < 0 && tag > 31)
	{
		return 'Error: Invalid tag';
	}

	return new Date(_tempJahr, _tempMonat, tag)

}


