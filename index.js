const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
require('dotenv').config();

const client = new Client();

let isActive = false; // حالة تشغيل الأداة

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
    // تجاهل الرسائل من غيرك (صاحب البوت)
    if (message.author.id !== client.user.id) return;

    const content = message.content.toLowerCase();

    if (content === 'on') {
        if (isActive) {
            return message.reply('🔄 الأداة مفعلة بالفعل.');
        }

        try {
            const channel = await client.channels.fetch(process.env.channel);

            joinVoiceChannel({
                channelId: channel.id,
                guildId: process.env.guild,
                selfMute: true,
                selfDeaf: true,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            isActive = true;
            message.reply('✅ تم تفعيل الأداة والدخول إلى القناة الصوتية.');
        } catch (error) {
            message.reply('❌ فشل في الاتصال بالقناة الصوتية.');
            console.error(error);
        }
    }

    if (content === 'off') {
        if (!isActive) {
            return message.reply('🛑 الأداة غير مفعلة أصلاً.');
        }

        const connection = getVoiceConnection(process.env.guild);
        if (connection) connection.destroy();

        isActive = false;
        message.reply('✅ تم إيقاف الأداة والخروج من القناة الصوتية.');
    }
});

client.login(process.env.token);
