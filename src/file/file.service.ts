import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  async saveFile(file: any): Promise<string> {
    try {
      let ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.jfif') {
        ext = '.jpg';
      }
      const fileName = uuid.v4() + ext;
      const filePath = path.join(process.cwd(), 'uploads', 'admins');

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      fs.writeFileSync(path.join(filePath, fileName), file.buffer);

      const baseUrl = process.env.BASE_URL;
      return `${baseUrl}/uploads/admins/${fileName}`;
    } catch (error) {
      throw new InternalServerErrorException('Filega yozishda xatolik');
    }
  }

  async saveMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const folder = 'products';
      const filePath = path.join(process.cwd(), 'uploads', folder);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      const baseUrl = process.env.BASE_URL;
      const urls: string[] = [];

      for (const file of files) {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.jfif') {
          ext = '.jpg';
        }
        const fileName = uuid.v4() + ext;

        fs.writeFileSync(path.join(filePath, fileName), file.buffer);
        urls.push(`${baseUrl}/uploads/${folder}/${fileName}`);
      }

      return urls;
    } catch (err) {
      throw new InternalServerErrorException('Fayllarni saqlashda xatolik');
    }
  }
}
