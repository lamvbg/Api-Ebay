import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary, v2 } from 'cloudinary';
import {Multer} from 'multer';
import bufferToStream = require('buffer-to-stream');


@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: 'dhburx7mh',
      api_key: '451152473225143',
      api_secret: 'BH4X7_DeS8EiPLPxPqBtrie0C7k',
    });
  }

  async uploadImage(
    file: Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    
      bufferToStream(file.buffer).pipe(upload);
    });
  }

  async getImageUrl(publicId: string) {
    try {
      const result = await cloudinary.image(publicId, { secure: true });
      return result;
    } catch (error) {
      console.error('Error getting image URL from Cloudinary:', error);
      throw error;
    }
  }
}
