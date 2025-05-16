import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: special-channel");
export default {
  data: new SlashCommandBuilder()
    .setName("yetki-kanali")
    .setDescription(
      "/ ile başlayan komutlar sadece seçilen kanalda kullanılabilir.",
    )
    .addChannelOption((option) =>
      option.setName("kanal").setDescription("Kanalı seç").setRequired(true),
    ),

  async execute(interaction) {
      const settings = await getSettings(interaction.guild.id);
      if (!settings) {
        await saveSettings(interaction.guild.id, { permissionChannel: ""});
        console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
      }
      await interaction.deferReply({ content: 'Komut çalıştı!', flags: MessageFlags.Ephemeral });
      
      const guildId = interaction.guild.id;
  
      const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
      const hasRole = interaction.member.roles.cache?.has(settings.permissionRole);
      
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
    try {
      const kanal = interaction.options.getChannel("kanal");

      // Sunucu ayarlarını güncelle
      settings.permissionChannel = kanal.id;

      await saveSettings(guildId, settings);
      // Başarılı yanıt
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#4BB543")
            .setTitle("✅ Kanala başarıyla yetki verildi")
            .addFields({ name: "Kanal", value: `${kanal}`, inline: true })
            .setFooter({ text: `Sunucu ID: ${guildId}` }),
        ],
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
