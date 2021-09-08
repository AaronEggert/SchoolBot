const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
    new SlashCommandBuilder().setName('homework').setDescription('Homework Command.')
    .addSubcommand(subcommand => 
        subcommand
            .setName('add')
            .setDescription('Adds Homework')
            .addStringOption(option => 
                option
                    .setName('fach')
                    .setDescription('Das Fach der Hausaufgabe.')
                    .setRequired(true)
                    .addChoice('Mathe', 'fach_mathe')
                    .addChoice('Deutsch', 'fach_deutsch')
                    .addChoice('Englisch', 'fach_englisch')
            )
            .addStringOption(option =>
                option
                    .setName('aufgabe')
                    .setDescription('Wie lautet die Aufgabe?')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('jahr')
                    .setDescription('Das Jahr vom Abgabedatum.')
                    .setRequired(true)
                    .addChoice('2021', 'year_2021')
                    .addChoice('2022', 'year_2022')
                    .addChoice('2023', 'year_2023')
                    .addChoice('2024', 'year_2024')
                    .addChoice('2025', 'year_2025')
                )
            .addStringOption(option =>
                option
                    .setName('monat')
                    .setDescription('Der Monat vom Abgabedatum.')
                    .setRequired(true)
                    .addChoice('Jannuar (01)', 'month_jannuar')
                    .addChoice('Februar (02)', 'month_februar')
                    .addChoice('März (03)', 'month_märz')
                    .addChoice('April (04)', 'month_april')
                    .addChoice('Mai (05)', 'month_mai')
                    .addChoice('Juni (06)', 'month_juni')
                    .addChoice('Juli (07)', 'month_juli')
                    .addChoice('August (08)', 'month_august')
                    .addChoice('September (09)', 'month_september')
                    .addChoice('Oktober (010)', 'month_oktober')
                    .addChoice('November (011)', 'month_november')
                    .addChoice('Dezember (012)', 'month_dezember')
                )
            .addIntegerOption(option => 
                option
                    .setName('tag')
                    .setDescription('Der Tag des Abgabedatums')
                    .setRequired(true)
                )
    )
    .addSubcommand(subcommand => 
        subcommand
            .setName('list')
            .setDescription('Lists all open homeworks')
    )
    .addSubcommand(subcommand =>  
        subcommand
            .setName('delete')
            .setDescription('Deletes Homework')
    )
    
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();