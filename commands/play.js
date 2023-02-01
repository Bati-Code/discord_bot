const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, Playtime } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment/moment');

const attendDate = new Date();
attendDate.setHours(5, 0, 0, 0);
let title = '출석 체크';
let message = '';
let value = '';
let totalTime = '';
let currentTime = '';
let channelEnterCheck = false;

const getPlayTimeQuery = async id => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await Playtime.findOne({
      where: { id: id, createdAt: { [Op.gte]: today } },
    });

    if (result == null) {
      message = '공부방에 아직 접속하지 않았네요 :)';
      return;
    }

    currentTime = new Date(new Date() - result.enter);

    if (result.check == 0) {
      currentTime = '공부방 접속 후 측정을 시작합니다 :)';
    } else {
      currentTime = moment(new Date(currentTime)).utcOffset(0).format('HH시간 mm분 ss초');
    }

    totalTime = moment(new Date(result.time)).utcOffset(0).format('HH시간 mm분 ss초');
  } catch (error) {
    console.log(error);
    title = '오류 발생!!!';
    message = '접속 시간 조회 중 방해꾼을 발견했어요!!! (관리자에게 문의하세요)';
  }
};

module.exports = {
  data: new SlashCommandBuilder().setName('시간').setDescription('접속 시간'),
  async execute(interaction) {
    if (interaction.user) {
      const [user, created] = await User.findOrCreate({
        where: { id: interaction.user.id },
        defaults: {
          name: interaction.user.username,
        },
      });
      if (created) {
        message = `환영합니다! ${user.name}님 시작이 반이에요. 열심히 해봐요 :)`;
        await getPlayTimeQuery(user.id);
      } else {
        message = `${user.name}`;
        await getPlayTimeQuery(user.id);
      }
    }

    const avatarURL = interaction.user.displayAvatarURL({
      size: 4096,
      dynamic: true,
    });

    const exampleEmbed = new EmbedBuilder()
      .setColor(0x4eab70)
      .setTitle(title)
      // .setURL('https://discord.js.org/')
      .setAuthor({ name: interaction.user.username, iconURL: avatarURL })
      // .setDescription('Some description here')
      // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields(
        { name: message, value: '  ' },
        { name: `일일 누적 접속 시간 : ${totalTime}`, value: '채널을 나간 후 집계가 됩니다 :)' },
        { name: `현재 접속 시간 : ${currentTime}`, value: `${value} ` }
        // { name: 'Inline field title', value: 'Some value here', inline: true }
      )
      // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
      // .setImage(avatarURL)
      .setTimestamp();
    // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    interaction.client.channels
      .fetch(interaction.channelId)
      .then(channel => channel.send({ embeds: [exampleEmbed] }))
      .catch(console.error);

    await interaction.reply('시간 조회');
  },
};
