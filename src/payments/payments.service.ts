import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PurchasePlanDto } from './payments.dto';
import { UserSubscriptionOrder } from 'src/entities/user/userSubscriptionOrder.entity';
import { SubscriptionOrderStatus } from 'src/entities/user/enums/user.enum';
const crypto = require('crypto');
const Razorpay = require('razorpay');
@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor() {
  console.log('RAZORPAY KEY ID:', process.env.RAZORPAY_KEY_ID);
  console.log(
    'RAZORPAY SECRET EXISTS:',
    !!process.env.RAZORPAY_KEY_SECRET,
  );
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }


  async handleRazorpayWebhook(rawBody: Buffer, signature: string) {
    try {
      console.log('Received Razorpay webhook----->', signature);
      if (!signature) {
        throw new BadRequestException('Razorpay webhook signature is missing');
      }

      if (!rawBody) {
        throw new BadRequestException('Razorpay webhook body is missing');
      }

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new BadRequestException(
          'Razorpay webhook secret is not configured',
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const signatureBuffer = Buffer.from(signature);

      const expectedSignatureBuffer = Buffer.from(expectedSignature);

      if (signatureBuffer.length !== expectedSignatureBuffer.length) {
        throw new BadRequestException('Invalid Razorpay webhook signature');
      }

      const isValidSignature = crypto.timingSafeEqual(
        signatureBuffer,
        expectedSignatureBuffer,
      );

      if (!isValidSignature) {
        throw new BadRequestException('Invalid Razorpay webhook signature');
      }

      const event = JSON.parse(rawBody.toString());

      switch (event.event) {
        case 'payment.captured':
          await this.handleRazorpayPaymentCaptured(event);
          break;

        case 'payment.failed':
          await this.handleRazorpayPaymentFailed(event);
          break;

        default:
          console.log(`Unhandled Razorpay webhook event: ${event.event}`);
          break;
      }

      return {
        received: true,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Unable to process Razorpay webhook');
    }
  }

  private async handleRazorpayPaymentCaptured(event: any) {
    const payment = event?.payload?.payment?.entity;

    if (!payment) {
      throw new BadRequestException('Payment information not found in webhook');
    }

    const razorpayOrderId = payment.order_id;

    const razorpayPaymentId = payment.id;

    const paymentAmount = Number(payment.amount);

    if (!razorpayOrderId) {
      throw new BadRequestException('Razorpay order ID not found');
    }

    if (!razorpayPaymentId) {
      throw new BadRequestException('Razorpay payment ID not found');
    }

    const subscriptionOrder = await UserSubscriptionOrder.findOne({
      where: {
        razorpayOrderId,
      },
      relations: ['subscriptionPlan'],
    });

    if (!subscriptionOrder) {
      throw new BadRequestException('Subscription payment order not found');
    }

    /*
     * Webhook can be delivered more than once.
     * If already processed, don't create another subscription.
     */
    if (subscriptionOrder.status === SubscriptionOrderStatus.PAID) {
      return;
    }

    /*
     * Verify that the amount received from Razorpay
     * matches the amount stored in our database.
     *
     * Our database stores amount in rupees.
     * Razorpay sends amount in paise.
     */
    const expectedAmount = Math.round(subscriptionOrder.price * 100);

    if (paymentAmount !== expectedAmount) {
      throw new BadRequestException(
        'Payment amount does not match subscription order',
      );
    }


    /*
     * Create learner subscription.
     */
    const startDate = new Date();

    const endDate = new Date(startDate);

    /*
     * Mark payment order as paid.
     */
    subscriptionOrder.status = SubscriptionOrderStatus.PAID;

    subscriptionOrder.razorpayPaymentId = razorpayPaymentId;

    subscriptionOrder.paidAt = new Date();

    await UserSubscriptionOrder.save(subscriptionOrder);
  }

  private async handleRazorpayPaymentFailed(event: any) {
    const payment = event?.payload?.payment?.entity;

    if (!payment) {
      return;
    }

    const razorpayOrderId = payment.order_id;

    if (!razorpayOrderId) {
      return;
    }

    const subscriptionOrder = await UserSubscriptionOrder.findOne({
      where: {
        razorpayOrderId,
      },
    });

    if (!subscriptionOrder) {
      return;
    }

    /*
     * Don't change a successfully paid order
     * back to failed.
     */
    if (subscriptionOrder.status === SubscriptionOrderStatus.PAID) {
      return;
    }

    subscriptionOrder.status = SubscriptionOrderStatus.FAILED;

    subscriptionOrder.razorpayPaymentId = payment.id;

    await UserSubscriptionOrder.save(subscriptionOrder);
  }

  async purchasePlan(
    dto: PurchasePlanDto,
  ) {
    try {

      if (
        dto.price === null ||
        dto.price === undefined ||
        Number(dto.price) <= 0
      ) {
        throw new BadRequestException(
          'Subscription plan price must be greater than zero',
        );
      }


      const razorpayOrder = await this.createOrder(
        dto.price,
        `learner_${dto.price}_plan_${Date.now()}`,
      );

      const subscriptionOrder = UserSubscriptionOrder.create({
        razorpayOrderId: razorpayOrder.id,
        price: dto.price,
        status: SubscriptionOrderStatus.CREATED,
      });

      await UserSubscriptionOrder.save(subscriptionOrder);

      return {
        message: 'Payment order created successfully',
        order: {
          id: subscriptionOrder.id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(error?.message);
      // console.error('PURCHASE PLAN ERROR:', error);
      // console.error('PURCHASE PLAN ERROR MESSAGE:', error?.message);
      // console.error('PURCHASE PLAN ERROR RESPONSE:', error?.response?.data);

      // throw error;
    }
  }


  async createOrder(
    amount: number,
    receipt: string,
  ) {
    const order = await this.razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
    });

    return order;
  }
}
