import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";
import db from "../firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export async function deleteAutoReactionChannel(guildId, channelId) {
  await db.collection("settings").doc(guildId).update({
    [`autoReaction.${channelId}`]: FieldValue.delete()
  });
}
console.log("Loaded event: autoreaction-delete");
export default {
  data: new SlashCommandBuilder()
    .setName("autoreaction-delete")
    .setDescription("Mesajlara otomatik emoji ekler")
    .addChannelOption((option) =>
      option
        .setName("kanal")
        .setDescription("Emojilerin ekleneceği kanal")
        .setRequired(true),
    ),

  async execute(interaction) {

    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, { autoReaction: {}, permissionRole: "" });
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
    try{
      const channel = interaction.options.getChannel("kanal");
      
      if(settings.autoReaction?.[channel.id])
      {
        console.log(settings.autoReaction[channel.id]);
        await saveSettings(guildId, settings);
        await deleteAutoReactionChannel(guildId,channel.id);

        console.log(settings.autoReaction[channel.id]);

        await interaction.editReply({
          content: `✅ ${channel} Kanalından emojiler silindi`,
          ephemeral: true,
        });
        console.log(channel.name, " Kanalından emojiler silindi");
      }else{
        await interaction.editReply({
          content: `❌ ${channel} Kanalından emoji yok.`,
          ephemeral: true,
        });
        console.log(channel.name, "Kanalda emoji yok");
      }
    } catch (error) {
      console.error("Hata:", error);
      await interaction.editReply({
        content: "❌ Ayarlar kaydedilirken bir hata oluştu!",
        embeds: [],
      });
    }
  },
};
