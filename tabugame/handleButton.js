// tabugame/handleButton.js
import { ChannelType, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

export async function handleTabuButton(interaction) {
  if (interaction.customId !== 'create_tabu_game') return;

  const guild = interaction.guild;
  const user = interaction.user;

  const gameId = uuidv4();

  // 1. Ses kanalı oluştur
  const voiceChannel = await guild.channels.create({
    name: `🎙️ Tabu - ${user.username}`,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
      },
    ],
  });

  // 2. Metin sohbetine admin paneli gönder
  const thread = await voiceChannel.createTextChannel?.() || voiceChannel;

  const settingsRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`tabu_settings_${gameId}`)
      .setPlaceholder('⚙️ Oyun Ayarlarını Seçin')
      .addOptions([
        {
          label: '⏱️ Süre: 60 saniye',
          value: 'time_60',
        },
        {
          label: '⏱️ Süre: 90 saniye',
          value: 'time_90',
        },
        {
          label: '⏱️ Süre: 120 saniye',
          value: 'time_120',
        },
        {
          label: '⏱️ Süre: 150 saniye',
          value: 'time_150',
        },
      ])
      .addOptions([
        {
          label: '🏆 Puan Limiti: 10',
          value: 'score_10',
        },
        {
          label: '🏆 Puan Limiti: 20',
          value: 'score_20',
        },
        {
          label: '🏆 Puan Limiti: 30',
          value: 'score_30',
        },
        {
          label: '🏆 Puan Limiti: 40',
          value: 'score_40',
        },
      ])
  );

  await thread.send({
    content: `🎛️ **Tabu Admin Paneli**  
Oyun başlamadan önce süre ve skor ayarlarını yapabilirsiniz.`,
    components: [settingsRow],
  });

  // 3. (Geçici) oyun bilgisini bellekte tut (ileride Firestore’a taşınacak)
  global.tabuGames = global.tabuGames || {};
  global.tabuGames[gameId] = {
    voiceChannelId: voiceChannel.id,
    createdBy: user.id,
    settings: {
      time: null,
      scoreLimit: null,
    },
    state: 'waiting',
  };

  await interaction.reply({ content: `✅ Yeni tabu oyunu oluşturuldu: ${voiceChannel.name}`, ephemeral: true });
}
