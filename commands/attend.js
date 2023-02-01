const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, Attend } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment/moment');

const offsetTime = moment().utcOffset(9);
offsetTime.hour(5).minute(0).second(0);
const attendDate = offsetTime.utcOffset(0);
const nowDate = moment().utcOffset(0);

console.log('A : ', attendDate);
console.log('B : ', nowDate);
let title = '출석 체크';
let message = '';
let totalCount = 0;
let recentCount = 0;

const attendQuery = async id => {
  try {
    console.log('출석체크-------------------------------------------------');
    console.log(attendDate, nowDate);
    const [attend, created] = await Attend.findOrCreate({
      where: { id: id, date: { [Op.gte]: attendDate } },
      defaults: {
        id: id,
        date: nowDate,
      },
    });
    if (created) {
      message = `${moment(attend.date).utcOffset(9).format('YYYY-MM-DD HH:mm:ss')}`;
    } else {
      message = '오늘은 이미 출석 체크 했어요 :)';
    }
  } catch (error) {
    console.log(error);
    title = '오류 발생!!!';
    message = '출석 체크 중 방해꾼을 발견했어요!!! (관리자에게 문의하세요)';
  }
};

const getTotalQuery = async id => {
  try {
    const count = await Attend.count({
      where: { id: id },
    });
    totalCount = count;
  } catch (error) {
    console.log(error);
    title = '오류 발생!!!';
    message = '출석 체크 중 방해꾼을 발견했어요!!! (관리자에게 문의하세요)';
  }
};

const getRecentQuery = async id => {
  try {
    const count = await Attend.count({
      where: { id: id, date: { [Op.lte]: new Date(), [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000 * 7) } },
    });
    recentCount = count;
  } catch (error) {
    console.log(error);
    title = '오류 발생!!!';
    message = '출석 체크 중 방해꾼을 발견했어요!!! (관리자에게 문의하세요)';
  }
};

module.exports = {
  data: new SlashCommandBuilder().setName('출첵').setDescription('출석 체크'),
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
        await attendQuery(user.id);
        await getTotalQuery(user.id);
        await getRecentQuery(user.id);
      } else {
        message = `${user.name}`;
        await attendQuery(user.id);
        await getTotalQuery(user.id);
        await getRecentQuery(user.id);
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
        { name: `누적 출석 : ${totalCount}회`, value: '    ' },
        { name: `최근 7일 출석 : ${recentCount}회`, value: '   ' }
        // { name: 'Inline field title', value: 'Some value here', inline: true }
      )
      // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
      .setImage(avatarURL)
      .setTimestamp();
    // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    interaction.client.channels
      .fetch(interaction.channelId)
      .then(channel => channel.send({ embeds: [exampleEmbed] }))
      .catch(console.error);

    await interaction.reply('출석 체크');
  },
};
