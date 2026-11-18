import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UtilsService {
    constructor(
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        private mailerService: MailerService
    ) {}

    // async otpgenerator(): Promise<string> {
    //     const otpGenerator = require('otp-generator');
    //     const otp = otpGenerator.generate(6, {
    //         digits: true,
    //         upperCaseAlphabets: false,
    //         lowerCaseAlphabets: false,
    //         specialChars: false,
    //     });
    //     console.log('Generated OTP:', otp);
    //     return otp;
    // }

    // async SendEmailByCode(
    //     user: User,
    //     emailBody?: string,
    //     emailReverify: boolean = false,
    //     newEmail?: string,
    // ): Promise<User> {
    //     const otp = await this.otpgenerator();
        
    //     // Find existing OTP for user and remove it
    //     const alreadyOTP = await this.otpRepository.findOne({
    //         where: { user: { id: user.id } },
    //     });

    //     if (alreadyOTP) {
    //         await this.otpRepository.remove(alreadyOTP);
    //     }

    //     // Create new OTP
    //     const userOtp = new Otp();
    //     userOtp.otp = otp;
    //     userOtp.user = user;
    //     await userOtp.setCodeExpiry(new Date(), 10); // 10 minutes expiry
    //     await userOtp.setNextOtp(new Date(), 2); // 2 minutes for next email

    //     await this.otpRepository.save(userOtp);
    //     await user.save();

    //     // Prepare email content
    //     const recipientEmail = newEmail ? newEmail : (user.email || '');
    //     if (!recipientEmail) {
    //         throw new Error('No email address available for sending OTP');
    //     }
        
    //     const emailSubject = emailReverify
    //         ? 'Verify Email Change Request'
    //         : `Your One-Time Password (OTP) for ${process.env.APP_NAME || 'Resto'} Account Verification`;

    //     let emailContent = emailBody;
    //     if (!emailContent) {
    //         emailContent = `
    //             <html>
    //                 <body>
    //                     <h2>Account Verification</h2>
    //                     <p>Hello ${user.name},</p>
    //                     <p>Your verification code is: <strong>${otp}</strong></p>
    //                     <p>This code will expire in 10 minutes.</p>
    //                     <p>If you didn't request this code, please ignore this email.</p>
    //                     <p>Best regards,<br>${process.env.APP_NAME || 'Resto'} Team</p>
    //                 </body>
    //             </html>
    //         `;
    //     } else {
    //         // Replace placeholders if any
    //         emailContent = emailContent.replace(/\{\{otp\}\}/g, otp);
    //         emailContent = emailContent.replace(/\{\{email\}\}/g, user.email || '');
    //         emailContent = emailContent.replace(/\{\{appName\}\}/g, process.env.APP_NAME || 'Resto');
    //     }

    //     // Send email
    //     try {
    //         await this.sendHtmlEmail(emailSubject, emailContent, recipientEmail);
    //         console.log('Email sent successfully to:', recipientEmail);
    //     } catch (error) {
    //         console.error('Error sending email:', error);
    //         throw new Error('Failed to send email');
    //     }

    //     return user;
    // }

    // async sendCodeBySMS(
    //     user: User,
    //     emailBody?: string,
    //     emailReverify: boolean = false,
    //     newEmail?: string,
    // ): Promise<string> {
    //     const otp = await this.otpgenerator();
        
    //     // Find existing OTP for user and remove it
    //     const alreadyOTP = await this.otpRepository.findOne({
    //         where: { user: { id: user.id } },
    //     });

    //     if (alreadyOTP) {
    //         await this.otpRepository.remove(alreadyOTP);
    //     }

    //     // Create new OTP
    //     const userOtp = new Otp();
    //     userOtp.otp = otp;
    //     userOtp.user = user;
    //     await userOtp.setCodeExpiry(new Date(), 10); // 10 minutes expiry
    //     await userOtp.setNextOtp(new Date(), 2); // 2 minutes for next SMS

    //     await this.otpRepository.save(userOtp);
    //     await user.save();

    //     const message = `Your verification code is ${otp}. It will expire in 10 minutes.`;

    //     try {
    //         if (process.env.ENABLE_SMS_API !== 'true') {
    //             console.log('SMS API call skipped');
    //             console.log(`SMS code: ${message}`);
    //             return 'SEND SMS API IS DISABLED';
    //         }

    //         const apiUrl = 'https://api2.smsala.com/SendSmsV2';

    //         const payload = [
    //             {
    //                 apiToken: process.env.SMS_API_TOKEN,
    //                 messageType: '1', // transactional
    //                 messageEncoding: '0', // ASCII (use "7" for Unicode)
    //                 destinationAddress: user?.mobile,
    //                 sourceAddress: process.env.SMS_SENDER_ID,
    //                 messageText: message,
    //             },
    //         ];

    //         const response = await axios.post(apiUrl, payload, {
    //             headers: { 'Content-Type': 'application/json' },
    //         });

    //         if (response.data[0]?.Status !== 'Success') {
    //             throw new Error('Failed to send SMS');
    //         }

    //         console.log('SMS sent successfully:', response.data);
    //     } catch (error) {
    //         console.error(
    //             'Error sending SMS:',
    //             error.response ? error.response.data : error.message,
    //         );
    //         throw new Error('Failed to send SMS');
    //     }

    //     return message;
    // }

    // async sendHtmlEmail(
    //     subject: string,
    //     html: string,
    //     email: string | string[],
    //   ): Promise<void> {
    //     console.log(process.env.FROM_NAME,process.env.FROM_ADDRESS)
    //     await this.mailerService
    //       .sendMail({
    //         to: email,
    //         from: {
    //           name: process.env.FROM_NAME || 'fourinone',
    //           address: process.env.FROM_ADDRESS || 'shivakumarangu555@gmail.com',
    //         },
    //         subject,
    //         html,
    //       })
    //       .then((rr) => {
    //         console.log('email.sent', rr);
    //       })
    //       .catch((err) => {
    //         console.log('error in email', err);
    //         throw err;
    //       });
    // }
}