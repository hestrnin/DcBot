import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ignore-channel")
    .setDescription("Seçilen kanaldan silinen mesajlar loglanmaz")
    .addChannelOption((option) =>
      option
        .setName("kanal")
        .setDescription("Loglanmayacak kanal")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName("durum").setDescription("Ekle/Kaldır").setRequired(true),
    ),

  async execute(interaction) {
      const settings = await getSettings(interaction.guild.id);
      if (!settings) {
        await saveSettings(interaction.guild.id, { ignoredChannels: [], permissionRole: "" });
        console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
      }
      await interaction.deferReply({ content: 'Komut çalıştı!', flags: MessageFlags.Ephemeral });
      
      const guildId = interaction.guild.id;
      
      const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
      const hasRole = interaction.member.roles.cache?.has(settings?.permissionRole);
      if (!hasAdmin && !hasRole) {
        const response = {
          content: "❌ kanal-ignore Bu komutu kullanmak için yetkin yok!",
          flags: MessageFlags.Ephemeral
        };
  
        if (!interaction.replied && !interaction.deferred) {
          await interaction.editReply(response);
        } else {
          await interaction.followUp(response);
        }
  
        return;
      }
    try{
      const channel = interaction.options.getChannel("kanal");
      const action = interaction.options.getBoolean("durum");
      if (!Array.isArray(settings.ignoredChannels)) {
        settings.ignoredChannels = [];
      }
      
      const channelIndex = settings?.ignoredChannels?.indexOf(channel.id,);
      
      if (action && channelIndex === -1) {
        // Ekle
        settings.ignoredChannels.push(channel.id);
      } else if (!action && channelIndex !== -1) {
        // Kaldır
        settings.ignoredChannels?.splice(channelIndex, 1);
      }
      await saveSettings(guildId,settings);
      await interaction.editReply({
        content: `✅ ${channel} kanalı ignore listesine ${action ? "**eklendi**" : "**kaldırıldı**"}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Hata:", error);
      await interaction.editReply({
        content: "❌ Ayarlar kaydedilirken bir hata oluştu!",
        embeds: [],
      });
    }
  },
};
