console.log("Loaded event: reminder");
import { PermissionFlagsBits } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

export default async function handleReminder(message) {
  const settings = await getSettings(message.guild.id);
  if (!settings) {
    await saveSettings(message.guild.id, { reminderRole: "" });
    console.log(`Yeni ayar oluşturuldu: ${message.guild.id}`);
  }
  const hasAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);
  const hasRole = message.member.roles.cache?.has(settings?.reminderRole);

  if (!hasAdmin && !hasRole) {
    const response = {
      content: "❌ Bu komutu kullanmak için yetkin yok!",
      flags: MessageFlags.Ephemeral
    };

    if (!message.replied && !message.deferred) {
      await message.reply(response);
    } else {
      await message.followUp(response);
    }

    return;
  }
  const prefix = "d!";
  if (!message.content.startsWith(prefix)) return;

  const [cmd, ...args] = message.content
    .slice(prefix.length)
    .trim()
    .split(/\s+/);
  if (cmd !== "reminder") return;

  const ms = require("ms");
  const timeArg = args[0];
  const text = args.slice(1).join(" ");
  const duration = ms(timeArg);

  if (!duration) {
    return message.reply("Geçerli bir süre gir (örn: `10s`, `5m`, `2h`).");
  }

  const sentMessage = await message.channel.send(
    `✅ ${ms(duration, { long: true })} Mesaj: ${text}`,
  );

  setTimeout(() => {
    message.delete().catch(console.error);
    sentMessage.delete().catch(console.error);
  }, 2000);

  setTimeout(() => {
    message.channel.send(`⏰ <@${message.author.id}> Hatırlatma: ${text}`);
  }, duration);
};
