const groupModel = require(`../../models/groupModel.js`);
const userModel = require(`../../models/userModel.js`);
const {replyWithEmbed} = require("../../functions/helpers/embedResponse")
const {SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`group`)
        .setDescription(`Create, join, or leave a group.`)
        .addSubcommand(subcommand => subcommand
            .setName(`create`)
            .setDescription(`Create a group.`)
            .addStringOption(option =>
                option.setName(`name`)
                    .setDescription(`The name of the group.`)
                    .setRequired(true)
            ))
        .addSubcommand(subcommand => subcommand
            .setName(`join`)
            .setDescription(`Join a group.`)
            .addStringOption(option =>
                option.setName(`name`)
                    .setDescription(`The name of the group.`)
                    .setRequired(true)
            ))
        .addSubcommand(subcommand => subcommand
            .setName(`leave`)
            .setDescription(`Leave your current group.`))
        .addSubcommand(subcommand => subcommand
            .setName(`info`)
            .setDescription(`Get information about a group.`)
            .addStringOption(option => option
                .setName(`name`)
                .setDescription(`The name of the group.`)
                .setRequired(true)
            ))

        .addSubcommand(subcommand => subcommand
            .setName(`list`)
            .setDescription(`List all groups.`)),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();
        const groupName = interaction.options.getString(`name`);
        let userData;

        try {
            await userModel.findOne({userID: interaction.user.id}).then(user => {
                userData = user;
            });
        } catch (e) {
            console.error(e.stack)
            return replyWithEmbed(interaction, `An error occurred while trying to find your user data.`, "#ff0000", ":red_circle: Error")
        }

        if (subcommand === `create`) {

            if (userData.cash < 10000) return replyWithEmbed(interaction, `You need at least $10,000 to create a group.`, "#ff0000", ":red_circle: Error")
            if (groupName.length > 20) return replyWithEmbed(interaction, `Group names must be 20 characters or less.`, "#ff0000", ":red_circle: Error")

            const groupExists = await groupModel.exists({name: groupName});
            if (groupExists) return replyWithEmbed(interaction, `A group with that name already exists.`, "#ff0000", ":red_circle: Error")


            const newGroup = new groupModel({
                name: groupName,
                owner: interaction.user.id,
                members: [interaction.user.id],
                balance: 0
            });

            try {
                // Attempt to create channel in category with ID 1086653364168839268
                const guild = interaction.guild;
                const category = guild.channels.cache.get(`1086653364168839268`);
                const channel = await guild.channels.create({
                    name: groupName,
                    type: ChannelType.GUILD_TEXT,
                    parent: category,
                    permissionOverwrites: [{ // Owner
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageChannels]
                    }]
                });
                await channel.setParent(category);
                await userModel.findOneAndUpdate({userID: interaction.user.id}, {$inc: {cash: -10000}});

                newGroup.balance = 10000;
                newGroup.channelID = channel.id;
                await newGroup.save();
                return replyWithEmbed(interaction, `You have successfully created the group ${groupName}, and have been given the channel <#${channel.id}>.`, "#00ff00", `:white_check_mark: Successfully created group`)
            } catch (e) {
                console.error(e.stack)
                return replyWithEmbed(interaction, `An error occurred while trying to create the group.`, "#ff0000", ":red_circle: Error")
            }
        }
        if (subcommand === 'join') {

            if (!groupName) return replyWithEmbed(interaction, `You must specify a group name.`, "#ff0000", ":red_circle: Error")

            const groupExists = await groupModel.exists({name: groupName});
            if (!groupExists) return replyWithEmbed(interaction, `A group with that name does not exist.`, "#ff0000", ":red_circle: Error")

            const groupData = await groupModel.findOne({name: groupName});
            if (groupData.members.includes(interaction.user.id)) return replyWithEmbed(interaction, `You are already in that group.`, "#ff0000", ":red_circle: Error")

            try {
                await groupModel.updateMany({members: interaction.user.id}, {$pull: {members: interaction.user.id}});
                await groupModel.findOneAndUpdate({name: groupName}, {$push: {members: interaction.user.id}});

                // Send message to group channel
                const guild = interaction.guild;
                const channel = guild.channels.cache.get(groupData.channelID);
                await channel.send(`<@${interaction.user.id}> has joined the group!`);

                return replyWithEmbed(interaction, `You have successfully joined the group ${groupName}.`, "#00ff00", `:white_check_mark: Successfully joined group`)
            } catch (e) {
                console.error(e.stack)
                return replyWithEmbed(interaction, `An error occurred while trying to join the group.`, "#ff0000", ":red_circle: Error")
            }

        }
        if (subcommand === 'leave') {

            const groupData = await groupModel.findOne({members: interaction.user.id});
            if (!groupData) return replyWithEmbed(interaction, `You are not in a group.`, "#ff0000", ":red_circle: Error")

            try {
                await groupModel.updateMany({members: interaction.user.id}, {$pull: {members: interaction.user.id}});

                const guild = interaction.guild;
                const channel = guild.channels.cache.get(groupData.channelID);
                await channel.send(`<@${interaction.user.id}> has left the group!`);

                return replyWithEmbed(interaction, `You have successfully left the group ${groupData.name}.`, "#00ff00", `:white_check_mark: Successfully left group`)
            } catch (e) {
                console.error(e.stack)
                return replyWithEmbed(interaction, `An error occurred while trying to leave the group.`, "#ff0000", ":red_circle: Error")
            }
        }
        if (subcommand === 'info') {

            if (!groupName) return replyWithEmbed(interaction, `You must specify a group name.`, "#ff0000", ":red_circle: Error")

            const groupExists = await groupModel.exists({name: groupName});
            if (!groupExists) return replyWithEmbed(interaction, `A group with that name does not exist.`, "#ff0000", ":red_circle: Error")

            const groupData = await groupModel.findOne({name: groupName});
            const owner = await interaction.client.users.fetch(groupData.owner);
            const members = [];
            for (const member of groupData.members) {
                const user = await interaction.client.users.fetch(member);
                members.push(user.tag);
            }

            const embed = new EmbedBuilder()
                .setColor(`#00ff00`)
                .setTitle(`Group Info`)
                .addFields(
                    {name: `Name`, value: groupData.name, inline: true},
                    {name: `Owner`, value: owner.tag, inline: true},
                    {name: `Members`, value: members.join(`\n`), inline: true},
                    {name: `Balance`, value: `$${groupData.balance}`, inline: true},
                )
                .setTimestamp()
                .setFooter(`Group ID: ${groupData._id}`);

            return interaction.reply({embeds: [embed]});
        }
        if (subcommand === 'list') {

            // list all groups
            const groups = await groupModel.find({});
            const groupNames = [];

            for (const group of groups) groupNames.push(
                `<#${group.channelID}> - `
                + `${group.members.length} ${group.members.length === 1 ? "member" : "members"} - `
                + `\$${group.balance.toLocaleString()}`)
            if (groupNames.length === 0) return replyWithEmbed(interaction, `There are no groups.`, "#ff0000", `:red_circle: Error`)
            await replyWithEmbed(interaction, `${groupNames.length} groups found!\n- ${groupNames.join(`\n- `)}`, "#00ff00", `:white_check_mark: Groups list`)
        }
    }
}
