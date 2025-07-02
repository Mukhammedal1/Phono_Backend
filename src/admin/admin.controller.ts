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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminCreatorGuard } from '../common/guards/admin_creator.guard';
import { JwtAdminAuthGuard } from '../common/guards/jwt_admin_auth.guard';
import { AdminSelfGuard } from '../common/guards/admin_self.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @UseGuards(JwtAdminAuthGuard, AdminCreatorGuard)
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  // @UseGuards(JwtAdminAuthGuard, AdminCreatorGuard)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  // @UseGuards(JwtAdminAuthGuard, AdminSelfGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  // @UseGuards(JwtAdminAuthGuard, AdminSelfGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Get('activate/:link')
  activate(@Param('link') link: string) {
    return this.adminService.activate(link);
  }

  // @UseGuards(JwtAdminAuthGuard, AdminCreatorGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
