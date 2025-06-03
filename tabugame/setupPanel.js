// tabugame/setupPanel.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import path from 'path';
import { readMessageId, writeMessageId } from './utils/messageStore.js';
import { handleTabuButton } from './handleButton.js';
import { test } from '../utils/importFromJson.js';

export async function setupTabuPanel(client) {
  const guild = client.guilds.cache.first();
  const channel = guild.channels.cache.find(c => c.name === 'tabu-oyna' && c.isTextBased());

  if (!channel) {
    console.warn('📛 #tabu-oyna kanalı bulunamadı.');
    return;
  }

    client.on('interactionCreate', async (interaction) => {
        console.log('interaction geldi'); // bu bile gelmiyorsa çok temel bir sorun var

        if (interaction.isButton()) {
            console.log(`Butona basıldı: ${interaction.customId}`);
            if (interaction.customId === 'create_tabu_game') {
                await handleTabuButton(interaction);
            }
        }
        if (interaction.isButton()) {
            console.log(`Butona basıldı: ${interaction.customId}`);
            if (interaction.customId === 'topluekle') {
                await test(interaction);
            }
        }
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('create_tabu_game')
      .setLabel('🎮 Yeni Oyun Oluştur')
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('topluekle')
      .setLabel('🎮 Toplu Ekle')
      .setStyle(ButtonStyle.Primary)
  );

  const panelContent = {
    content: `🎮 **Tabu Oyunu Paneli**\nAşağıdaki butona basarak yeni bir tabu oyunu başlatabilirsin.`,
    components: [row],
  };
  const panelContent2 = {
    content: `🎮 **toplu ekle**.`,
    components: [row2],
  };

  await channel.send(panelContent2);
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