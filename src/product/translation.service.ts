// google-translate.service.ts

import { Injectable } from '@nestjs/common';
import { Translate } from '@google-cloud/translate/build/src/v2';

@Injectable()
export class GoogleTranslateService {
  private readonly translate: Translate;

  constructor() {
    // Đọc thông tin Service Account từ tệp tin JSON
    const serviceAccount = require('../../leafy-analyst-412313-1b2d64acbfbc.json');

    // Tạo một phiên bản của dịch vụ Google Translate với xác thực từ Service Account
    this.translate = new Translate({ credentials: serviceAccount });
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const [translation] = await this.translate.translate(text, targetLanguage);
      return translation;
    } catch (error) {
      console.error('Error translating text:', error);
      return null;
    }
  }
}
