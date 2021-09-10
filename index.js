
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
			const fach = convertFach(interaction.options.getString('fach'))
			const aufgabe = interaction.options.getString('aufgabe')
			const jahr = interaction.options.getString('jahr')
			const monat = interaction.options.getString('monat')
			const tag = interaction.options.getInteger('tag')
			
			const inputs = {
				fach: fach,
				aufgabe: aufgabe,
				abgabe: interactionDataToDate(jahr, monat, tag)
			}

			const error = new MessageEmbed()
				.setColor('#E74C3C')
				.setTitle("")
				.setDescription(':x: Error: Invalid date - Dieses Datum war anscheinend schon');


			dif = difTime(inputs.abgabe)
			if (dif.tage <= 0 && dif.stunden <= 0) {
				interaction.reply({embeds: [error]})
				return
			}

			const embed2 = new MessageEmbed()
				.setColor('#2ECC71')
				.setTitle("")
				.setDescription(':white_check_mark: Aufgabe wurde Erfolgreich hinzugefügt!');

			const embed1 = new MessageEmbed()
				.setColor(fachZuFarbe(inputs.fach))
				.setTitle('')
				.setDescription(`**Aufgabe**:	${inputs.aufgabe}\n**Fach**:\t${inputs.fach}\n **Datum**:\t${inputs.abgabe.tag}.${inputs.abgabe.monat}.${inputs.abgabe.jahr}\n **Ersteller**:\t${interaction.user.tag}`)

			await interaction.reply({embeds: [embed1, embed2]})
			var data  = fs.readFileSync('./data.json'),
    		json = JSON.parse(data)
			servers = json.Servers
			
			guildID = interaction.guildId
			
			if (!servers[guildID]) {
				servers[guildID] = {}
			}

			server = servers[guildID]
			if (server.aufgaben || server["aufgaben"]) {
				server["aufgaben"].push({"fach": inputs.fach, "aufgabe": inputs.aufgabe, "abgabe": {"jahr": inputs.abgabe.getFullYear(), "monat": inputs.abgabe.getMonth(), "tag": inputs.abgabe.getDate()}, "ersteller": interaction.user.tag, "id": ID()})
			}
			else {
				server["aufgaben"] = []
				server["aufgaben"].push({"fach": inputs.fach, "aufgabe": inputs.aufgabe, "abgabe": {"jahr": inputs.abgabe.getFullYear(), "monat": inputs.abgabe.getMonth(), "tag": inputs.abgabe.getDate()}, "ersteller": interaction.user.tag, "id": ID()})
			}

			fs.writeFileSync('./data.json', JSON.stringify(json, null, 3));

		}
		else if (interaction.options.getSubcommand() === 'list') {
			var data	= fs.readFileSync('./data.json'),
				json	= JSON.parse(data),
				servers = json.Servers,
				guildID = interaction.guildId;
			



			id = interaction.options.getString('id') 
			console.log(id)
			console.log('--------------------------')
			if (id) {
				var isIn = false;
				for (let i = 0; i < servers[guildID].aufgaben.length; i++) {
					console.log(servers[guildID].aufgaben[i].id)
					if (servers[guildID].aufgaben[i].id == id) { 
						isIn = true;
						
						dateAufgabe = new Date(servers[guildID].aufgaben[i].abgabe.jahr, servers[guildID].aufgaben[i].abgabe.monat, servers[guildID].aufgaben[i].abgabe.tag)
						const embedEinzelnAufgabe = new MessageEmbed()
							.setColor(fachZuFarbe(convertFach(servers[guildID].aufgaben[i].fach)))						
							.setTitle(`Aufgbae: ${id}`)
							.setDescription(`**Fach**:      ${servers[guildID].aufgaben[i].fach}\n**Aufgabe**:   ${servers[guildID].aufgaben[i].aufgabe}\n**Abgabe**:    ${dateAufgabe.getDay()} ${dateAufgabe.getDate()}.${dateAufgabe.getMonth()}.${dateAufgabe.getFullYear()}\nEs sind noch \`${interactionDataToDate(servers[guildID].aufgaben[i].abgabe).tag}\` Tag/e und \`${interactionDataToDate(servers[guildID].aufgaben[i].abgabe).stunden}\` Stunden bis zur Abgabe\n**Ersteller**: ${servers[guildID].aufgaben[i].ersteller}`)
						interaction.reply({embeds:[embedEinzelnAufgabe]});
						return;
					} else {
						const embedErrorID = new MessageEmbed()
							.setTitle('')
							.setDescription(':x: Error: Invaild ID')
							.setColor('#C0392B')
						interaction.reply({embeds:[embedErrorID]});
					}
				}
			}


			const errorGuild = new MessageEmbed()
				.setColor('#E74C3C')
				.setTitle(' ')
				.setDescription(':x: Error: Es gab einen Fehler beim lesen der Serverdatei, bitte versuche es doch später erneut');
			
			

			if (!servers[guildID]) {
				await interaction.reply({embeds: [errorGuild]});
				return;
			}

			var server = servers[guildID];
			
			
			if (server.aufgaben.length > 0) {
				const embedAufgaben = new MessageEmbed()
				.setColor(getRandomColor())
				.setTitle('Folgende Aufgaben sind zu erledigen')
				.setDescription(' ')

				for (let i = 0; i < server.aufgaben.length; i++) {
					embedAufgaben
						.addField(`${i} `, `**Fach**: ${server.aufgaben[i].fach}\n**Aufgabe**: ${server.aufgaben[i].aufgabe}\n**Abgabe:** Es sind noch \`${difTime(server.aufgaben[i].abgabe).tage}\` Tage/n und \`${difTime(server.aufgaben[i].abgabe).stunden}\` Stunde/n bis zur Abgabe\n**Ersteller**: ${server.aufgaben[i].ersteller}\n**ID**: ${server.aufgaben[i].id}`, false)
				}
				interaction.reply({embeds: [embedAufgaben]});
			}
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

function convertFach(fach) {
	switch (fach)
	{
		case 'fach_mathe':
			return 'mathe';
		case 'fach_deutsch': 
			return 'deutsch';
		case 'fach_englisch':
			return 'englisch';
		default:
			return 'Error: Invalid fach';
	}
}

function fachZuFarbe(fach) {
	switch(fach) {
		case 'mathe':
			return 0x3498DB
		case 'deutsch': 
			return 0xE74C3C
		case 'englisch':
			return 0xE67E22
		default:
			return 'Error: Invalid fach'
	}
	
}

function difTime(date) {
	date = new Date(date.jahr, date.monat, date.tag);
	
	dif =  ( date.getTime() - 2628000000 + (10 * 3600000)) - new Date().getTime() ;
	tage = 0
	for (let i = 0; dif >= 86400000; i++) {
		dif -= 86400000;
		tage++;
	}
	return zeit = {
		"stunden": Math.round(dif / 3600000),
		"tage": tage
	}
}

function getRandomColor() {
	colors = ['#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#34495E', '#16A085', '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#F1C40F', '#E67E22', '#E74C3C', '#ECF0F1', '#95A5A6', '#F39C12', '#D35400', '#C0392B', '#BDC3C7', '#7F8C8D'] 
	return colors[Math.floor(Math.random() * colors.length)];
}

// return unic id	
function ID () {
	return '' + Math.random().toString(36).substr(2, 6);
  };
