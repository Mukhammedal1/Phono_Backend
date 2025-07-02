import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ArchivesService } from './archives.service';
import { CreateArchiveDto } from './dto/create-archive.dto';
import { UpdateArchiveDto } from './dto/update-archive.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtAdminAuthGuard } from '../common/guards/jwt_admin_auth.guard';

@ApiBearerAuth()
@Controller('archives')
export class ArchivesController {
  constructor(private readonly archivesService: ArchivesService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createArchiveDto: CreateArchiveDto) {
    return this.archivesService.create(createArchiveDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.archivesService.findAll();
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.archivesService.findOne(+id);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArchiveDto: UpdateArchiveDto) {
    return this.archivesService.update(+id, updateArchiveDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.archivesService.remove(+id);
  }
}
