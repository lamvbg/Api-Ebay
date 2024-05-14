import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EbayAuthService {
  private readonly clientId = process.env.EBAY_CLIENT_ID;
  private readonly clientSecret = process.env.EBAY_CLIENT_SECRET;
  private readonly scope = process.env.EBAY_SCOPE;
  private accessToken: string;
  private tokenExpiryTime: number;

  async getAccessToken(): Promise<string> {
    try {
      if (!this.accessToken || Date.now() >= this.tokenExpiryTime) {
        await this.refreshAccessToken();
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    try {
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
      const expiresIn = response.data.expires_in;
      this.tokenExpiryTime = Date.now() + expiresIn * 1000;
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw error;
    }
  }
}
