import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EbayService {
  private readonly ebayApiUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
  private readonly clientId = process.env.EBAY_CLIENT_ID;
  private readonly clientSecret = process.env.EBAY_CLIENT_SECRET;
  private readonly scope = process.env.EBAY_SCOPE;

  private accessToken: string;

  async getAccessToken(): Promise<string> {
    try {
      if (!this.accessToken) {
        const response = await axios.post(
          'https://api.ebay.com/identity/v1/oauth2/token',
          null,
          {
            params: {
              grant_type: 'client_credentials',
              scope: this.scope,
            },
            auth: {
              username: this.clientId,
              password: this.clientSecret,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        this.accessToken = response.data.access_token;
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchItems(categoryId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(`${this.ebayApiUrl}?category_ids=${categoryId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
  async getItem(itemId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(`https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
