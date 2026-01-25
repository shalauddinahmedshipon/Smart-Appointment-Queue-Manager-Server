import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService], // make it available to other modules
})
export class CloudinaryModule {}
