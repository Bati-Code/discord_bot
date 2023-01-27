const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../models');

module.exports = {
  data: new SlashCommandBuilder().setName('user').setDescription('출석체크'),
  async execute(interaction) {
    let message = '';
    if (interaction.user) {
      console.log(interaction);
      const [user, created] = await User.findOrCreate({
        where: { id: interaction.user.id },
        defaults: {
          name: interaction.user.username,
        },
      });

      if (created) {
        message = `환영합니다! ${user.name}`;
      } else {
        message = `${user.name}`;
      }
    }

    await interaction.reply(message);
  },
};
