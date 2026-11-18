import { Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PurchasePlanDto } from './payments.dto';
import { Body } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('razorpay/webhook')
  async razorpayWebhook(
    @Req() request,

    @Headers('x-razorpay-signature')
    signature: string,
  ) {
    return this.paymentsService.handleRazorpayWebhook(
      request.rawBody,
      signature,
    );
  }

  @Post('purchase-plan')
  async purchasePlan(
    @Body() purchasePlanDto: PurchasePlanDto,
  ) {
    return this.paymentsService.purchasePlan(purchasePlanDto);
  }
}
