
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const { isArrayBufferView } = require('util/types');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}, at ${new Date()}.`);
	checking();
	setInterval(checking,(6000 * 60 * 8));
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		checkInTime(interaction);
	} else if (commandName === 'user') {
		SetHausaufgabenHilfeAktiv(true, interaction.guild);
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
				.setDescription(`**Aufgabe**:	${inputs.aufgabe}\n**Fach**:\t${inputs.fach}\n **Datum**:\t${inputs.abgabe.getDate()}.${inputs.abgabe.getMonth()}.${inputs.abgabe.getFullYear()}\n **Ersteller**:\t${interaction.user.tag}`)

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
				guildID = interaction.guildId,
				id = interaction.options.getString('id');
			
			if (id) {
				for (let i = 0; i < servers[guildID].aufgaben.length; i++) {
					if (servers[guildID].aufgaben[i].id == id) { 
						dateAufgabe = new Date(servers[guildID].aufgaben[i].abgabe.jahr, servers[guildID].aufgaben[i].abgabe.monat, servers[guildID].aufgaben[i].abgabe.tag)
						const embedEinzelnAufgabe = new MessageEmbed()
							.setColor(fachZuFarbe(servers[guildID].aufgaben[i].fach))						
							.setTitle(`Aufgabe: ${id}`)
							.setDescription(`**Fach**:      ${servers[guildID].aufgaben[i].fach}\n**Aufgabe**:   ${servers[guildID].aufgaben[i].aufgabe}\n**Abgabe**:   ${dateAufgabe.getDate()}.${dateAufgabe.getMonth()}.${dateAufgabe.getFullYear()}\nEs sind noch \`${difTime(servers[guildID].aufgaben[i].abgabe).tage}\` Tag/e und \`${difTime(servers[guildID].aufgaben[i].abgabe).stunden}\` Stunden bis zur Abgabe\n**Ersteller**: ${servers[guildID].aufgaben[i].ersteller}`)
						interaction.reply({embeds:[embedEinzelnAufgabe]});
						return;
					}
				}
				const embedErrorID = new MessageEmbed()
							.setTitle(' ')
							.setDescription(':x: Error: Invaild ID')
							.setColor('#C0392B')
						interaction.reply({embeds:[embedErrorID]});
				return;
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
			else {
				const embedKeineAufgaben = new MessageEmbed()
					.setTitle('')
					.setDescription('Es sind keine offnen Aufgaben')
					.setColor('#8E44AD');
				interaction.reply({embeds:[embedKeineAufgaben]});
			}
		}
		else if (interaction.options.getSubcommand() === 'delete') {
			var data	= fs.readFileSync('./data.json'),
				json	= JSON.parse(data),
				servers = json.Servers,
				guildID = interaction.guildId,
				id 		= interaction.options.getString('id');
			
			if (id) {
				if (servers[guildID].aufgaben.length != 0) {
					for (let i = 0; i < servers[guildID].aufgaben.length; i++) {
						if (servers[guildID].aufgaben[i].id == id) {
							delete servers[guildID].aufgaben[i];
							 var filter = servers[guildID].aufgaben.filter(function (el) {
								return el != null;
							  });
							servers[guildID].aufgaben = filter;
							console.log(servers[guildID].aufgaben)

							fs.writeFileSync('./data.json', JSON.stringify(json, null, 3));
							
							const embedDeleteSuccess = new MessageEmbed()
							  .setColor('#27AE60')
							  .setTitle('')
							  .setDescription(`:white_check_mark: Aufgabe Erfolgreich Gelöscht: \`${id}\``)

							interaction.reply({embeds: [embedDeleteSuccess]});
							return;
						}
					}
				}

				const embedKeineAufgaben = new MessageEmbed()
					.setTitle('')
					.setDescription('Es sind keine offnen Aufgaben die du löschen kannst')
					.setColor('#8E44AD');
				interaction.reply({embeds:[embedKeineAufgaben]});
			}
		}
		else if (interaction.options.getSubcommand() === 'help') {
			var beschreibung 	= interaction.options.getString('problem'),
				id  			= interaction.options.getString('id'),
				aufgabenID		= null,
				guild			= interaction.guild,
				data			= fs.readFileSync('./data.json'),
				json			= JSON.parse(data),
				servers 		= json.Servers,
				guildID 		= interaction.guildId,
				server 			= servers[guildID];
				category		= server.config.hausaufgabenHilfe.category;

			if (id) {
				for (let i = 0; i < server.aufgaben.length; i++) {
					if (id == server.aufgaben[i].id) {
						aufgabenID = id;
					}
				}
			}
			
			var help = {
				problem: beschreibung,
				id: aufgabenID,
				guild: guild,
				category: guild.channels.cache.find(ch => ch.name.startsWith('Hausaufgaben-hilfe')),
				user: interaction.user.tag
			};

			guild.roles.create({
				name: `help-${server.config.hausaufgabenHilfe.helps.length + 1}`,
				color: '#BDC3C7'
			  }).then(helpRole => {

				  // var helpRole = guild.roles.cache.find(role => role.name.startsWith(`help-${server.config.hausaufgabenHilfe.helps.length + 1}`))
				//   console.log(helpRole);
				  guild.channels.create(`help-${server.config.hausaufgabenHilfe.helps.length + 1}`, {
					  type: "GUILD_TEXT",
					  permissionOverwrites: [
						  {
							type: 'role',  
							id: guild.roles.everyone,
							allow: [],
							deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "CONNECT"]
						  },
						  {
							type: 'role',
						  	id: helpRole.id,
						  	allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
							deny: []
						  }
					  ],
					}).then(result => {
						var member = guild.members.cache.get(interaction.user.id);
			
						member.roles.add(helpRole);	
					  //   channel = guild.channels.cache.find(ch => ch.name.startsWith(`help-${server.config.hausaufgabenHilfe.helps.length + 1}`));
					  //   console.log(result)
						if (result) {result.setParent(help.category.id)}
						
						if (help.id) {
							for (let i = 0; i < server.aufgaben.length; i++) {
								if (help.id == server.aufgaben[i].id) {
									const embedEinzelnAufgabe = new MessageEmbed()
												.setColor(fachZuFarbe(servers[guildID].aufgaben[i].fach))						
												.setTitle(`Aufgabe: ${id}`)
												.setDescription(`**Fach**:      ${servers[guildID].aufgaben[i].fach}\n**Aufgabe**:   ${servers[guildID].aufgaben[i].aufgabe}\n**Abgabe**: Es sind noch \`${difTime(servers[guildID].aufgaben[i].abgabe).tage}\` Tag/e und \`${difTime(servers[guildID].aufgaben[i].abgabe).stunden}\` Stunden bis zur Abgabe\n**Ersteller**: ${servers[guildID].aufgaben[i].ersteller}`)
												
											
									result.send({embeds:[embedEinzelnAufgabe]});
								}
			
							}
						}
						const embedHelp1 = new MessageEmbed()
							.setColor(getRandomColor())
							.setTitle(`${help.user} braucht Hilfe!`)
							.setDescription(`**Problem**: ${help.problem}`)
			
						result.send({embeds:[embedHelp1]});
			
						
						
						const embedReturn = new MessageEmbed()
							.setColor('#27AE60')
							.setTitle('')
							.setDescription(':white_check_mark: Hilfe wurde Erstellt')
						
						interaction.reply({embeds:[embedReturn]});
			
						server.config.hausaufgabenHilfe.helps.push({"nummer": server.config.hausaufgabenHilfe.helps.length + 1, "helpChannel": result.id, "helpRole": helpRole.id,"problem": help.problem, "aufgabenID": help.id, "ersteller": help.user})
						fs.writeFileSync('./data.json', JSON.stringify(json, null, 3));
					});
			  })
			

		}
	}
	if (commandName === 'setup') {
		const embedStartMessage = new MessageEmbed()
			.setColor(getRandomColor())
			.setTitle('Bot einrichten')
			.setDescription('Vielen dank für das benuzen des Bots! \n')

			var data	= fs.readFileSync('./data.json'),
				json	= JSON.parse(data),
				servers = json.Servers,
				guildID = interaction.guildId,
				server 	= servers[guildID];
					
			const hausaufgabenChannel = interaction.options.getChannel('hausaufgaben-channel');
			var logChannel = interaction.options.getChannel('log-channel');
			if (logChannel.type != 'GUILD_TEXT') {
				logChannel = null;
			}
			else {
				logChannel = logChannel.id;
			}

			if (hausaufgabenChannel.type == 'GUILD_TEXT') {
				server['config'] = {
					"hausaufgabenChannel": hausaufgabenChannel.id,
					"logChannel": logChannel
				}
				fs.writeFileSync('./data.json', JSON.stringify(json, null, 3));
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
	console.log(_tempJahr, _tempMonat, tag)
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

function ConvertZahlZuWochentag(zahl) {
	switch (zahl) {
		case 0: return 'Montag'
		case 1: return 'Dienstag'
		case 2: return 'Mitwoch'
		case 3: return 'Donnerstag'
		case 4: return 'Freitag'
		case 5: return 'Samstag'
		case 6: return 'Sonntag'
		default: return 'Error: Invalid zahl'
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

function checkInTime(guildID) {
	var data	= fs.readFileSync('./data.json'),
		json	= JSON.parse(data),
		servers	= json.Servers,
		server 	= servers[guildID];

	for (let i = 0; i < server.aufgaben.length; i++) {
		var dif = difTime(server.aufgaben[i].abgabe);
		if (dif.tage == 0 && dif.stunden <= 0) {
			delete server.aufgaben[i];
		}
	}

	haChannel = client.guilds.cache.find(g => g.id == guildID).channels.cache.find(ch => ch.id == server.config.hausaufgabenChannel);
	// console.log(haChannel);
	try {
		haChannel.bulkDelete(50);
	}
	catch (e) {
		console.log(e);
	}
	if (haChannel) {
		const embedHaChannel = new MessageEmbed();
		if (server.aufgaben.length >= 0) {
			embedHaChannel
				.setColor('#8E44AD')
				.setDescription(':white_check_mark: Es sind zurzeit keine Hausaugaben in den \`nächsten 2 Tagen\` offen')
		} else {
			embedHaChannel
				.setColor('#1ABC9C')
				.setDescription('Folgende Aufgaben sind in den nächsten 2 Tagen fällig:')
		}
		haChannel.send({embeds: [embedHaChannel]});
		
		for (let i = 0; i < server.aufgaben.length; i++) {
			if (difTime(server.aufgaben[i].abgabe).tage <= 2) {
				const embedAufgabe = new MessageEmbed()
					.setColor(fachZuFarbe(server.aufgaben[i].fach))
					.setTitle(`Aufgabe: ${server.aufgaben[i].id}`)
					.setDescription(`**Fach**:      ${server.aufgaben[i].fach}\n**Aufgabe**:   ${server.aufgaben[i].aufgabe}\n**Abgabe**: Es sind noch \`${difTime(server.aufgaben[i].abgabe).tage}\` Tag/e und \`${difTime(server.aufgaben[i].abgabe).stunden}\` Stunden bis zur Abgabe\n**Ersteller**: ${server.aufgaben[i].ersteller}`)
				
				haChannel.send({embeds: [embedAufgabe]});
					
			}
		}
	} else {

	}


	var filter = server.aufgaben.filter(function (el) {
		return el != null;
	});
	server.aufgaben = filter;
	fs.writeFileSync('./data.json', JSON.stringify(json, null, 3));
}

function updateAusaufgabenChannel() {
	
}

function SetHausaufgabenHilfeAktiv(boolean, guild) { 
	if (boolean) {
		channel = guild.channels.cache.find(ch => ch.name.startsWith('Hausaufgaben-hilfe'));
		if (channel) {
			// console.log(channel.id); 
			var data	= fs.readFileSync('./data.json'),
			json	= JSON.parse(data),
			servers	= json.Servers,
			guildID = guild.id,
			server 	= servers[guildID];
			for (let i = 0; i < server.config.hausaufgabenHilfe.helps.length; i++) {
				var current = server.config.hausaufgabenHilfe.helps[i];
				// guild.channels.cache.find(ch => ch.name.startsWith(`help-${i+1}`)).delete();
				guild.channels.cache.find(ch => ch.id == current.helpChannel).delete();
				guild.roles.cache.find(role => role.id == current.helpRole).delete();

			}
			
			
			channel.delete();
		}
		
		guild.channels.create('Hausaufgaben-hilfe', {
			type: "GUILD_CATEGORY", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
			permissionOverwrites: [
				{
					id: guild.roles.everyone,
					allow: ["VIEW_CHANNEL"],
					deny: ["SEND_MESSAGES", "CONNECT"]
				}
			],
		  }).then(result => {
			var data	= fs.readFileSync('./data.json'),
			json	= JSON.parse(data),
			servers	= json.Servers,
			guildID = guild.id,
			server 	= servers[guildID];

			server.config["hausaufgabenHilfe"] = {"category": result.id, "helps": []}
			fs.writeFileSync('./data.json', JSON.stringify(json, null, 3));
		  });
		category = guild.channels.cache.find(ch => ch.name.startsWith('Hausaufgaben-hilfe'));
		// console.log(category)
		
	}
	else if (!boolean) {
		channel = guild.channels.cache.find(ch => ch.name.startsWith('hausaufgaben-hilfe'));
		if (channel) {
			channel.delete();
			var data	= fs.readFileSync('./data.json'),
			json	= JSON.parse(data),
			servers	= json.Servers,
			guildID = guild.id,
			server 	= servers[guildID];
			for (let i = 0; i < server.config.hausaufgabenHilfe.helps.length; i++) {
				var current = server.config.hausaufgabenHilfe.helps[i];
				// guild.channels.cache.find(ch => ch.name.startsWith(`help-${i+1}`)).delete();
				guild.channels.cache.find(ch => ch.id == current.helpChannel).delete();
				console.log(guild.roles.find(role => role.id == current.helpRole));
			}
		}
	}
}

function checking() {
	var	data	= fs.readFileSync('./data.json'),
		json	= JSON.parse(data),
		servers	= json.Servers;

	for (i in servers) {
		// console.log(i);
		checkInTime(i)
	}
}