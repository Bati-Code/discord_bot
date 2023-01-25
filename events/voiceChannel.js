const { Events } = require('discord.js');
const { Playtime } = require('../models');
const { Op } = require('sequelize');

const userStack = [];
const channelName = 'Test';

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    oldState.guild.channels
      .fetch(oldState.channelId)
      .then(channel => {
        if (channel.name != channelName) return;
        const findUserIndex = userStack.findIndex(e => e.id == oldState.id);

        if (findUserIndex == -1) return;

        const time = userStack[findUserIndex]?.time ?? 0;
        userStack.splice(findUserIndex, 1);
        console.log('OLD : ', userStack);

        if (time > 0) {
          const diff = new Date().getTime() - new Date(time).getTime();
          const diffDate = new Date(diff);
          UpdatePlayTime(oldState.id, diffDate.getTime());
        }
      })
      .catch(console.error);

    newState.guild.channels
      .fetch(newState.channelId)
      .then(channel => {
        if (channel.name != channelName) return;
        const findUserIndex = userStack.findIndex(e => e.id == newState.id);
        if (findUserIndex != -1) {
          userStack.splice(findUserIndex, 1);
        }
        userStack.push({ id: newState.id, time: new Date() });
        EnterVoiceChannel(newState.id);
        console.log('NEW : ', userStack);
      })
      .catch(console.error);
  },
};

const EnterVoiceChannel = async id => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const [playtime, created] = await Playtime.findOrCreate({
      where: { id: id, createdAt: { [Op.gte]: today } },
      defaults: {
        id: id,
        date: new Date(),
        enter: new Date(),
        time: 0,
        createdAt: new Date(),
      },
    });

    if (!created) {
      const result = await Playtime.update(
        { enter: new Date() },
        { where: { id: id, createdAt: { [Op.gte]: today } } }
      );
      console.log(result);
    }
  } catch (error) {
    console.log(error);
  }
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
        createdAt: new Date(),
      },
    });

    if (!created) {
      const result = await Playtime.increment({ time: time }, { where: { id: id, createdAt: { [Op.gte]: today } } });
      console.log(result);
    }
  } catch (error) {
    console.log(error);
  }
};
