import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload an image to Cloudinary
   */
  async uploadImage(file: Express.Multer.File, folder = 'portfolio'): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, resource_type: 'image' },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });
  }

  /**
   * Delete an image from Cloudinary using URL
   */
  async deleteImageByUrl(url: string) {
    const publicId = this.getPublicIdFromUrl(url);
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Extract Cloudinary publicId from URL
   */
  private getPublicIdFromUrl(url: string): string {
    // example:
    // https://res.cloudinary.com/demo/image/upload/v1729297134/project/abc123.jpg
    const parts = url.split('/');
    const folder = parts[parts.length - 2];
    const fileName = parts[parts.length - 1].split('.')[0];
    return `${folder}/${fileName}`;
  }
}
