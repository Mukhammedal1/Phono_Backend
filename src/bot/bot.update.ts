import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BotService } from './bot.service';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Action(/^approve_\d+$/)
  async onApprove(@Ctx() ctx: Context) {
    await this.botService.onApprove(ctx);
  }

  @Action(/^reject_\d+$/)
  async onReject(@Ctx() ctx: Context) {
    await this.botService.onReject(ctx);
  }
}
