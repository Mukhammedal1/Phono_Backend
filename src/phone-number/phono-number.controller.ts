import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PhonoNumberService } from './phono-number.service';
import { UpdatePhonoNumberDto } from './dto/update-phono-number.dto';
import { CreatePhoneNumberDto } from './dto/create-phono-number.dto';

@Controller('phono-number')
export class PhonoNumberController {
  constructor(private readonly phonoNumberService: PhonoNumberService) {}

  @Post()
  create(@Body() createPhonoNumberDto: CreatePhoneNumberDto) {
    return this.phonoNumberService.create(createPhonoNumberDto);
  }

  @Get()
  findAll() {
    return this.phonoNumberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phonoNumberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhonoNumberDto: UpdatePhonoNumberDto) {
    return this.phonoNumberService.update(+id, updatePhonoNumberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phonoNumberService.remove(+id);
  }
}
