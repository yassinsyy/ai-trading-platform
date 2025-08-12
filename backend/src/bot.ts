import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

export function createBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    const kb = new InlineKeyboard().webApp('Открыть Келісім AI', process.env.TELEGRAM_WEBAPP_URL!);
    await ctx.reply('Келісім AI — договор за 3 минуты. Нажмите, чтобы начать.', { reply_markup: kb });
  });

  // Placeholder: deliver PDF by URL
  bot.command('help', (ctx) => ctx.reply('Используйте кнопку WebApp для начала.'));

  return bot;
}

if (process.env.NODE_ENV !== 'test') {
  const bot = createBot();
  bot.start();
}