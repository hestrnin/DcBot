import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: medya");
export default {
  data: new SlashCommandBuilder()
    .setName("medya-kanali-ayarla")
    .setDescription("Medya kanalını ve log kanalını belirler")
    .addChannelOption((option) =>
      option
        .setName("medya-kanal")
        .setDescription("Medya kanalını ve log kanalını belirler")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName("durum").setDescription("Ekle/Kaldır").setRequired(true),
    ),

  async execute(interaction) {

    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, { medyaChannel: {}, permissionRole: "" });
      console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
    }
    await interaction.deferReply({ content: 'Komut çalıştı!', flags: MessageFlags.Ephemeral });
    
    const guildId = interaction.guild.id;

    const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
    const hasRole = interaction.member.roles.cache?.has(settings?.permissionRole);
    
    if (!hasAdmin && !hasRole) {
      const response = {
        content: "❌ Bu komutu kullanmak için yetkin yok!",
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
      const channel = interaction.options.getChannel("medya-kanal");
      const action = interaction.options.getBoolean("durum");

      if (!Array.isArray(settings.medyaChannel)) {
        settings.medyaChannel = [];
      }
      
      const channelIndex = settings?.medyaChannel?.indexOf(channel.id,);
      
      if (action && channelIndex === -1) {
        // Ekle
        settings.medyaChannel.push(channel.id);
      } else if (!action && channelIndex !== -1) {
        // Kaldır
        settings.medyaChannel.splice(channelIndex, 1);
      }
      await saveSettings(guildId,settings);

      await interaction.editReply({
         content: `✅ ${channel} kanalı only medya listesine ${action ? "**eklendi**" : "**kaldırıldı**"}`,
        ephemeral: true,
      });
      return;

    } catch (error) {
      console.error("Hata:", error);
      await interaction.editReply({
        content: "❌ Ayarlar kaydedilirken bir hata oluştu!",
        embeds: [],
      });
    }
  },
};
