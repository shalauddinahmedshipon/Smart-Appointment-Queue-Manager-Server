import { Injectable } from '@nestjs/common';
import { Public } from './common/decorators/public.decorators';

@Injectable()
export class AppService {
  @Public()
  getHello(): string {
    return 'Hello World!';
  }
}
