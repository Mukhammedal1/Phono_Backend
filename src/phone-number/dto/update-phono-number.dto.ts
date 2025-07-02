import { PartialType } from '@nestjs/swagger';
import { CreatePhoneNumberDto } from './create-phono-number.dto';

export class UpdatePhonoNumberDto extends PartialType(CreatePhoneNumberDto) {}
