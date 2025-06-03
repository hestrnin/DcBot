// tabugame/setupPanel.js
import { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { readMessageId, writeMessageId } from './utils/messageStore.js';

export async function setupTabuPanel(guild) {
  let category = guild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.name == "Tabu")
  let channel = guild.channels.cache.find(c => c.name === 'tabu-oyna' && c.isTextBased());
  let channelKelimeler = guild.channels.cache.find(c => c.name === 'tabu-kelimeler' && c.isTextBased());

  if(!category)
  {
    console.warn('📛 #tabu kategorisi bulunamadı.');
    category = await guild.channels.create({
        name: `Tabu`,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          },
        ],
      });
  }

  if (!channel) {
    console.warn('📛 #tabu-oyna kanalı bulunamadı.');
    channel = await guild.channels.create({
        name: `tabu-oyna`,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          },
        ],
      });
  }

  if (!channelKelimeler) {
    console.warn('📛 #tabu-kelimeler kanalı bulunamadı.');
    channelKelimeler = await guild.channels.create({
        name: `tabu-kelimeler`,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          },
        ],
      });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('create_tabu_game')
      .setLabel('🎮 Yeni Oyun Oluştur')
      .setStyle(ButtonStyle.Primary)
  );

  const panelContent = {
    content: `🎮 **Tabu Oyunu Paneli**\nAşağıdaki butona basarak yeni bir tabu oyunu başlatabilirsin.`,
    components: [row],
  };

  const oldMessageId = readMessageId();

  let panelMessage;
  if (oldMessageId) {
    try {
      const previous = await channel.messages.fetch(oldMessageId);
      panelMessage = await previous.edit(panelContent);
    } catch {
      panelMessage = await channel.send(panelContent);
    }
  } else {
    panelMessage = await channel.send(panelContent);
  }

  writeMessageId(panelMessage.id);
}

export async function setupBirlestirmeButon(guild) {
  const channel = guild.channels.cache.find(c => c.name === 'tabu-oyna' && c.isTextBased());

  if (!channel) {
    console.warn('📛 #tabu-oyna kanalı bulunamadı.');
    return;
  }

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('topluekle')
      .setLabel('🎮 Toplu Ekle')
      .setStyle(ButtonStyle.Primary)
  );

  const panelContent2 = {
    content: `🎮 **toplu ekle**.`,
    components: [row2],
  };

  await channel.send(panelContent2);
}