
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

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

			await interaction.reply(`${fach}, ${aufgabe}, ${jahr}, ${monat}, ${tag}`)

			var data  = fs.readFileSync('./data.json'),
    		json = JSON.parse(data)
			servers = json.Servers
			
			guildID = interaction.guildId
			
			console.log(guildID)
			

			// Letze  	versuchen das automatisch array erstellt wenn nicht vorhanden und eingetragen werden und sonst im vorhandenen array eintragen
			servers[guildID]["aufgaben"].push({fach:fach, aufgabe:aufgabe, tag:tag})

			fs.writeFileSync('./data.json', JSON.stringify(json, null, 4));

		}
	}


});

client.login(token);