const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands'); // komut klasörün
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.ALLAH_TOKEN_KEY);

(async () => {
  try {
    console.log('🚫 Eski komutlar siliniyor...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.ALLAH_CLIENT_KEY, "1281647360950407188"),
      { body: [] } // 🔥 Tüm komutları sil
    );

    console.log('🎉 Komutlar başarıyla güncellendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
})();
