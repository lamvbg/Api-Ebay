import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      '858151451750-mrugeu9fj2rhb1l9i1mhu23972j3g32b.apps.googleusercontent.com',
      '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',
      'https://developers.google.com/oauthplayground',
    );
    
    oauth2Client.setCredentials({
      refresh_token: '1//04PPO-Fs_xIkBCgYIARAAGAQSNwF-L9IrhuwXV4pIOjvoXn9MAT5ysxH1BMhGFJ7rPVF912gL2BbIHZNCBz88Bbts2z7vQHhO3qA' 
    });
    

    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'lamvbgcd191320@fpt.edu.vn',
        clientId:'858151451750-mrugeu9fj2rhb1l9i1mhu23972j3g32b.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1//04PPO-Fs_xIkBCgYIARAAGAQSNwF-L9IrhuwXV4pIOjvoXn9MAT5ysxH1BMhGFJ7rPVF912gL2BbIHZNCBz88Bbts2z7vQHhO3qA',
        accessToken: oauth2Client.getAccessToken()
      }
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: '',
      to,
      subject,
      html
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendContact(from: string, to: string, subject: string, html: string) {
    const mailOptions = {
      from, 
      to,
      subject,
      html
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
