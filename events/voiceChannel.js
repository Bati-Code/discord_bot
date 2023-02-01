const { Events } = require('discord.js');
const { User, Playtime } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment/moment');

const userStack = [];
const channelName = '공부방';
const eventVoiceChannel = process.env.REAL_CHANNEL_ID;
const sendChannel = process.env.REAL_TEXT_CHANNEL;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    console.log('A_______________________________________________A');
    console.log(moment().utcOffset(9).format('YYYY-MM-DD HH:mm:ss'));
    // console.log('OLD : ', oldState);
    // console.log('NEW : ', newState);
    oldState.guild.channels
      .fetch(oldState.channelId)
      .then(channel => {
        console.log('OLDNAME :', channel.name);
        if (channel.id != eventVoiceChannel || newState.channelId == eventVoiceChannel) return;
        const findUserIndex = userStack.findIndex(e => e.id == oldState.id);

        if (findUserIndex == -1) return;

        const time = userStack[findUserIndex]?.time ?? 0;
        userStack.splice(findUserIndex, 1);
        console.log('OLD : ', userStack);

        if (time > 0) {
          const diff = new Date().getTime() - new Date(time).getTime();
          const diffDate = new Date(diff);
          oldState.client.channels.cache
            .get(sendChannel)
            .send(
              `아 ${moment(diffDate).utcOffset(0).format('HH시간 mm분 ss초')}있었네... 그런데 ${
                oldState.member.user.username
              } 벌써 가려고..?`
            );
          UpdatePlayTime(oldState.id, diffDate.getTime());
        }
      })
      .catch(console.error);
    newState.guild.channels
      .fetch(newState.channelId)
      .then(channel => {
        console.log('NEWNAME:', channel.name);
        if (channel.id != eventVoiceChannel || oldState.channelId == eventVoiceChannel) return;
        newState.client.channels.cache.get(sendChannel).send(`반가워요 ${newState.member.user.username} 친구 :)`);
        const findUserIndex = userStack.findIndex(e => e.id == newState.id);
        if (findUserIndex != -1) {
          userStack.splice(findUserIndex, 1);
        }
        userStack.push({ id: newState.id, time: new Date() });
        EnterVoiceChannel(newState.id, newState.member.user.id, newState.member.user.username);
        console.log('NEW : ', userStack);
      })
      .catch(console.error);
  },
};

const EnterVoiceChannel = async (id, userId, userName) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const [user, createdUser] = await User.findOrCreate({
      where: { id: userId },
      defaults: {
        name: userName,
      },
    });
    const [playtime, created] = await Playtime.findOrCreate({
      where: { id: id, createdAt: { [Op.gte]: today } },
      defaults: {
        id: id,
        date: new Date(),
        enter: new Date(),
        check: 1,
        time: 0,
        createdAt: new Date(),
      },
    });

    if (!created) {
      const result = await Playtime.update(
        { enter: new Date(), check: 1 },
        { where: { id: id, createdAt: { [Op.gte]: today } } }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const FindPlayTime = async (id, time) => {

};

const UpdatePlayTime = async (id, time) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const [playtime, created] = await Playtime.findOrCreate({
      where: { id: id, createdAt: { [Op.gte]: today } },
      defaults: {
        id: id,
        time: time,
        check: 0,
        createdAt: new Date(),
      },
    });
    if (!created) {
      const result = await Playtime.increment(
        { time: time, check: -1 },
        { where: { id: id, createdAt: { [Op.gte]: today } } }
      );
      // console.log(result);
    }
  } catch (error) {
    console.log(error);
  }
};
