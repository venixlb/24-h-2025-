const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
});

let connection;

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
  
  try {
    const channel = await client.channels.fetch(process.env.channel);
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: process.env.guild,
      selfMute: true,
      selfDeaf: true,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    console.log('Successfully connected to the voice channel.');
  } catch (error) {
    console.error('Error connecting to voice channel:', error);
  }
});

// أمر لإيقاف التثبيت
client.on('messageCreate', async (message) => {
  if (message.content === '!stop') {
    if (connection) {
      connection.destroy();
      console.log('Disconnected from voice channel');
    }
  }

  // أمر لفك الميوت
  if (message.content === '!unmute') {
    if (message.member.voice.channel) {
      await message.member.voice.setMute(false); // فك الميوت
      console.log('Unmuted');
    }
  }

  // أمر لفك الدفن
  if (message.content === '!undeaf') {
    if (message.member.voice.channel) {
      await message.member.voice.setDeaf(false); // فك الدفن
      console.log('Undeafed');
    }
  }
});

client.login(process.env.token);
