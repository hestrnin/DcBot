// index.js - Firebase uyumlu hale getirilmiş hali

import express from "express";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL  } from "url";
import { getSettings, saveSettings } from "./utils/firebase-settings.js";
import fs from "fs";
import handleReminder from "./prefix-commands/reminder.js";
import medyaLog from "./medya_log.js";
import deleteMessages from "./delete_messages.js";
import messageCreateHandler from "./events/messageCreate.js";
import { setupTabuPanel, setupBirlestirmeButon } from './tabugame/setupPanel.js';
import { handleTabuButton } from './tabugame/handleButton.js';
import { test } from './utils/importFromJson.js';

// __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

app.get("/", (req, res) => {
  res.send("Bot aktif.");
});
app.listen(3000);

async function startBot() {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const command = await import(fileUrl);
    client.commands.set(command.default.data.name, command.default);
  }

  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const event = await import(fileUrl);
    client.on(event.default.name, (...args) => event.default.execute(...args));
  }

  await medyaLog(client);
  await deleteMessages(client);
  await messageCreateHandler(client);

  client.on("interactionCreate", async (interaction) => {
  // Butonlar
  if (interaction.isButton()) {
    const { customId, guild } = interaction;
    console.log(`🔘 Butona basıldı: ${customId}`);

    if (customId === 'create_tabu_game') {
      try {
        await handleTabuButton(interaction);
      } catch (error) {
        console.error("❌ Oyun oluşturma hatası:", error);
        await interaction.editReply({ content: "⚠️ Oyun oluşturulurken bir hata oluştu." });
      }
    }

    if (customId === 'topluekle') {
      try {
        await interaction.deferReply({ flags: 1 << 6 });

        const channelKelimeler = guild.channels.cache.find(
          c => c.name === 'tabu-kelimeler' && c.isTextBased()
        );

        if (!channelKelimeler) {
          await interaction.editReply({ content: "⚠️ 'tabu-kelimeler' kanalı bulunamadı." });
          return;
        }

        await test(channelKelimeler);
        await interaction.editReply({ content: "🚀 Tüm kelimeler işlendi" });
      } catch (error) {
        console.error("❌ Toplu ekleme hatası:", error);
        await interaction.editReply({ content: "⚠️ Kelimeler eklenirken bir hata oluştu." });
      }
    }

    return; // Buton etkileşimiydi, burada bitiriyoruz
  }

  // Slash komutlar
  if (interaction.isCommand()) {
    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, {
        deleteMessageLog: "",
        deleteMediaLog: "",
        permissionRole: "",
      });
      return interaction.reply({ content: "Ayarlar oluşturuldu. Komutu tekrar kullanın.", ephemeral: true });
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Komut çalıştırılırken hata oluştu!", ephemeral: true });
    }
  }
});


  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    handleReminder(message);

    if(message.content === "d!tabusetup"){
      await setupTabuPanel(message.guild);
    }

    if(message.content === "d!tabubirlestirme"){
      await setupBirlestirmeButon(message.guild);
    }

    if (message.content === "!ping") {
      message.channel.send("Pong!");
    }
  });

  
client.once("ready", async () => {
  console.log(`Bot aktif: ${client.user.tag}`);

    await client.application.commands.set([
    {
      name: "log-kanali-ayarla",
      description: "Log kanallarını belirler",
      options: [
        {
          type: 7, // Kanal tipi
          name: "mesaj-log",
          description: "Silinen yazı mesajlarının gideceği kanal",
          required: true,
        },
        {
          type: 7,
          name: "medya-log",
          description: "Silinen medyaların gideceği kanal",
          required: true,
        },
      ],
    },
    {
      name: "tabu-kelime",
      description: "Tabu oyunu için kelime ekle.",
      options: [
        {
          type: 3,
          name: "kelime",
          description: "Anlatılacak Kelime",
          required: true,
        },
        {
          type: 3,
          name: "yasak1",
          description: "Yasaklı Kelime 1",
          required: true,
        },
        {
          type: 3,
          name: "yasak2",
          description: "Yasaklı Kelime 2",
          required: true,
        },
        {
          type: 3,
          name: "yasak3",
          description: "Yasaklı Kelime 3",
          required: true,
        },
        {
          type: 3,
          name: "yasak4",
          description: "Yasaklı Kelime 4",
          required: true,
        },
        {
          type: 3,
          name: "yasak5",
          description: "Yasaklı Kelime 5",
          required: true,
        },
        {
          type: 3,
          name: "liste",
          description: "Liste Belirt",
          required: true,
        },
      ],
    },
    {
      name: "autoreaction",
      description: "Mesajlara otomatik emoji ekler",
      options: [
        {
          type: 7,
          name: "kanal",
          description: "Emojilerin ekleneceği kanal",
          required: true,
        },
        {
          type: 3,
          name: "emojiler",
          description: "Virgülle ayırarak emojiler (Örnek: 👍❤️)",
        },
      ],
    },
    {
      name: "autoreaction-delete",
      description: "Otomatik eklemeyi kaldır.",
      options: [
        {
          type: 7,
          name: "kanal",
          description: "Emojilerin kaldırılacağı kanal",
          required: true,
        },
      ],
    },
    {
      name: "medya-log-kanali",
      description: "Medya log kanalını belirle.",
      options: [
        {
          type: 7,
          name: "log-kanal",
          description: "Kanalı seç.",
          required: true,
        },
      ],
    },
    {
      name: "medya-kanali-ayarla",
      description: "Sadece Medya kanalı - 1den fazla kanal seçebilirsin",
      options: [
        {
          type: 7,
          name: "medya-kanal",
          description: "Medya paylaşımı yapılacak kanal",
          required: true,
        },
        {
          type: 5, // BOOLEAN tipi
          name: "durum",
          description: "Ekle/Kaldır",
          required: true,
        },
      ],
    },
    {
      name: "ignore-channel",
      description: "Seçilen kanaldan silinen mesajlar loglanmaz",
      options: [
        {
          type: 7, // Kanal tipi
          name: "kanal",
          description: "Loglanmayacak kanal",
          required: true,
        },
        {
          type: 5, // BOOLEAN tipi
          name: "durum",
          description: "Ekle/Kaldır",
          required: true,
        },
      ],
    },
    {
      name: "yetki-ayarla",
      description: "/ komutlarını kullanmak için özel rol ayarla.",
      options: [
        {
          type: 8,
          name: "rol",
          description: "Yetki verilecek rol",
          required: true,
        },
      ],
    },
    {
      name: "reminder-rol",
      description: "d!reminder rolü için yetki. (d!reminder 10m bu mesajı bana 10 dakika sonra hatırlat)",
      options: [
        {
          type: 8,
          name: "rol",
          description: "Yetki verilecek rol",
          required: true,
        },
      ],
    },
    {
      name: "delete-reminder-rol",
      description: "d!reminder rol yetkisini kaldırır.",
    },
    {
      name: "delete-yetki-ayarla",
      description: "/ komutlarını kullanmak için özel rolü kaldırır.",
    },
    {
      name: "delete-medya-log",
      description: "/ komutlarını kullanmak için özel rolü kaldırır.",
    },
    {
      name: "delete-log-kanali",
      description: "/ komutlarını kullanmak için özel rolü kaldırır.",
    },
    /*{
      name: "yetki-kanali",
      description: "/ komutlarını kullanmak için özel kanal ayarla.",
      options: [
        {
          type: 7,
          name: "kanal",
          description: "Kanalı seç",
          required: true,
        },
      ],
    },
    {
      name: "komut-yonet",
      description: "Komutları açıp kapatır",
      options: [
        {
          type: 3, // STRING tipi
          name: "komut",
          description: "Yönetilecek komut adı",
          required: true,
          choices: [
            // Sabit seçenekler (autocomplete kullanmıyorsanız)
            { name: "log-ayarla", value: "log-ayarla" },
            { name: "medya-log", value: "medya-log" },
            // Diğer komutlarınızı buraya ekleyin
          ],
        },
        {
          type: 5, // BOOLEAN tipi
          name: "durum",
          description: "Açık/Kapalı durumu",
          required: true,
        },
      ],
    },*/
    // Diğer komutlarınızı buraya ekleyebilirsiniz
  ]);

  console.log("✅ Slash komutları global olarak kaydedildi!");
});

  await client.login(process.env.ALLAH_TOKEN_KEY).catch(err => console.error("Login hatası:", err));
}

startBot().catch(console.error);

/*client.login(process.env.ALLAH_TOKEN_KEY).catch(err => console.error("Login hatası:", err));
client.on("error", console.error);*/
