import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Reusable file upload interceptor for any controller
 * Usage: @UseInterceptors(FileUploadInterceptor)
 */
export const FileUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(), // store file in memory for Cloudinary upload
});
