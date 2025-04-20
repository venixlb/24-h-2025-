require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({ checkUpdate: false });
let joined = false;

client.on('ready', () => {
  console.log(${client.user.username} is ready!);
});

client.on('messageCreate', async (message) => {
  // تجاهل الرسائل من غير حسابك
  if (message.author.id !== client.user.id) return;

  const content = message.content.toLowerCase();

  // أمر الدخول إلى الروم
  if (content === '!on') {
    if (joined) return message.reply('أنا بالفعل في الروم الصوتي.');

    try {
      const channel = await client.channels.fetch(process.env.channel);
      joinVoiceChannel({
        channelId: channel.id,
        guildId: process.env.guild,
        selfMute: true,  // ميوت عند الدخول
        selfDeaf: true,  // دفن عند الدخول
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      joined = true;
      message.reply('تم الدخول إلى الروم الصوتي.');
    } catch (err) {
      console.error(err);
      message.reply('حدث خطأ أثناء محاولة الدخول إلى الروم.');
    }
  }

  // أمر الخروج من الروم
  if (content === '!off') {
    if (!joined) return message.reply('أنا لست في روم صوتي.');

    try {
      const connection = getVoiceConnection(process.env.guild);
      if (connection) {
        connection.destroy();
        joined = false;
        message.reply('تم الخروج من الروم الصوتي.');
      } else {
        message.reply('لا يوجد اتصال صوتي حالياً.');
      }
    } catch (err) {
      console.error(err);
      message.reply('حدث خطأ أثناء محاولة الخروج.');
    }
  }

  // أمر فك الميوت والدفن
  if (content === '!unmute') {
    try {
      const connection = getVoiceConnection(process.env.guild);
      if (connection) {
        connection._state.connection.setSpeaking(true); // اختياري
        connection._state.connection.receiver.speaking = true; // اختياري

        // للأسف مكتبة @discordjs/voice لا تدعم تغيير selfMute/selfDeaf بعد الاتصال.
        // لذلك لازم تعمل reconnect بدون ميوت:
        const channel = await client.channels.fetch(process.env.channel);
        connection.destroy(); // نفصل الاتصال القديم
        joinVoiceChannel({
          channelId: channel.id,
          guildId: process.env.guild,
          selfMute: false,
          selfDeaf: false,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        message.reply('تم فك الميوت والدفن.');
      } else {
        message.reply('أدخل إلى الروم أولاً باستخدام !on.');
      }
    } catch (err) {
      console.error(err);
      message.reply('حدث خطأ أثناء فك الميوت.');
    }
  }
});

client.login(process.env.token);
