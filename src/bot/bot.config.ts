import { TelegrafModuleOptions } from 'nestjs-telegraf';

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined');
}

export const botConfig: TelegrafModuleOptions = {
  token: process.env.BOT_TOKEN as string,
};
