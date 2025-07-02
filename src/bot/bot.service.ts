import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { PhoneService } from '../phone/phone.service';
import { InjectBot } from 'nestjs-telegraf';
import { InputMediaPhoto } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class BotService {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    @Inject(forwardRef(() => PhoneService))
    private readonly phoneService: PhoneService,
  ) {}

  async sendAdToAdmin(text: string, advertiseId: number) {
    const adminIds = (process.env.ADMIN_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    for (const adminId of adminIds) {
      await this.bot.telegram.sendMessage(adminId, text, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ Tasdiqlash',
                callback_data: `approve_${advertiseId}`,
              },
            ],
            [
              {
                text: '❌ Bekor qilish',
                callback_data: `reject_${advertiseId}`,
              },
            ],
          ],
        },
      });
    }
  }
  // async sendAdToAdmin(text: string, advertiseId: number, images: string[]) {
  //   const adminId = process.env.ADMIN_ID as string;

  //   if (images.length > 0) {
  //     const media: InputMediaPhoto[] = images.map((url, index) => ({
  //       type: 'photo',
  //       media: url,
  //       ...(index === 0 && { caption: text, parse_mode: 'HTML' }),
  //     }));

  //     // Rasmlar yuboriladi (caption faqat birinchi rasmda)
  //     await this.bot.telegram.sendMediaGroup(adminId, media);

  //     // Tugmalarni alohida yuboramiz
  //     await this.bot.telegram.sendMessage(
  //       adminId,
  //       "👇 E'lonni tasdiqlash/bekor qilish",
  //       {
  //         reply_markup: {
  //           inline_keyboard: [
  //             [
  //               {
  //                 text: '✅ Tasdiqlash',
  //                 callback_data: `approve_${advertiseId}`,
  //               },
  //             ],
  //             [
  //               {
  //                 text: '❌ Bekor qilish',
  //                 callback_data: `reject_${advertiseId}`,
  //               },
  //             ],
  //           ],
  //         },
  //       },
  //     );
  //   } else {
  //     // Agar rasm yo'q bo‘lsa, oddiy text + tugmalar yuboramiz
  //     await this.bot.telegram.sendMessage(adminId, text, {
  //       parse_mode: 'HTML',
  //       reply_markup: {
  //         inline_keyboard: [
  //           [
  //             {
  //               text: '✅ Tasdiqlash',
  //               callback_data: `approve_${advertiseId}`,
  //             },
  //           ],
  //           [
  //             {
  //               text: '❌ Bekor qilish',
  //               callback_data: `reject_${advertiseId}`,
  //             },
  //           ],
  //         ],
  //       },
  //     });
  //   }
  // }

  async onApprove(ctx: Context) {
    try {
      const advertiseId = ctx.callbackQuery!['data'].split('_')[1];
      if (!advertiseId) return;
      await this.phoneService.approveAdvertise(parseInt(advertiseId));
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: '✅ Tasdiqlandi', callback_data: 'approved' }],
        ],
      });
    } catch (error) {
      console.log('onApprove error', error);
    }
  }

  async onReject(ctx: Context) {
    try {
      // const advertiseId = ctx.callbackQuery!['data'].split('_')[1];
      // if (!advertiseId) return;
      // await this.phoneService.approveAdvertise(parseInt(advertiseId));
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: '❌ Bekor qilindi', callback_data: 'rejected' }],
        ],
      });
    } catch (error) {
      console.log('onReject error', error);
    }
  }
}
