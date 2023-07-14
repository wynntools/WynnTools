const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { getUUID } = require('../../api/mojangAPI.js');
const config = require('../../../config.json');
const { readFile } = require('fs/promises');
const { request } = require('undici');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('profile'),
  async execute(interaction) {
    try {
      if (!interaction.user.id == config.discord.devId) throw new Error('You are not allowed to use this command');
    } catch (error) {
      console.log(error);
      interaction.reply({ content: `${error}` });
    }
  },
};
