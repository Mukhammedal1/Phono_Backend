import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileModule } from '../file/file.module';

@Module({
  imports : [PrismaModule,FileModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports:[ImageService]
})
export class ImageModule {}
