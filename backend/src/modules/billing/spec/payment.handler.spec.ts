import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CommandBus } from '@nestjs/cqrs';
import { PaymentsQueueHandler } from '../infrastructure/queueHandlers/payment.handler';
import { BillingService } from '../billing.service';
import { Job } from 'bullmq';
import { PayBookingStatusCommand } from '../../booking/application/commands/booking.commands';

describe('PaymentsQueueHandler', () => {
  let handler: PaymentsQueueHandler;
  let billingService: jest.Mocked<BillingService>;
  let commandBus: jest.Mocked<CommandBus>;

  const makeJob = (name: string, data: object) => ({ name, data }) as Job;

  const successJobData = {
    bookingId: 'booking-1',
    paymentIntentId: 'pi_stripe_abc',
    userId: 'user-1',
  };

  const failedJobData = {
    bookingId: 'booking-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsQueueHandler,
        { provide: BillingService, useValue: createMock<BillingService>() },
        { provide: CommandBus, useValue: createMock<CommandBus>() },
      ],
    }).compile();

    handler = module.get(PaymentsQueueHandler);
    billingService = module.get(BillingService);
    commandBus = module.get(CommandBus);
  });

  describe('payment_success job', () => {
    it('calls successPayment with bookingId and paymentIntentId', async () => {
      const job = makeJob('payment_success', successJobData);
      billingService.successPayment.mockResolvedValue(undefined);
      commandBus.execute.mockResolvedValue(undefined);
      await handler.process(job);
      expect(billingService.successPayment).toHaveBeenCalledWith(
        successJobData.bookingId,
        successJobData.paymentIntentId,
      );
    });

    it('calls commandBus.execute(PayBookingStatusCommand) with userId and bookingId', async () => {
      const job = makeJob('payment_success', successJobData);
      billingService.successPayment.mockResolvedValue(undefined);
      commandBus.execute.mockResolvedValue(undefined);
      await handler.process(job);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(commandBus.execute).toHaveBeenCalledWith(
        new PayBookingStatusCommand(
          successJobData.userId,
          successJobData.bookingId,
        ),
      );
    });

    it('first successPayment, then commandBus.execute', async () => {
      const callOrder: string[] = [];
      const job = makeJob('payment_success', successJobData);
      billingService.successPayment.mockImplementation(() => {
        callOrder.push('success');
        return Promise.resolve();
      });
      commandBus.execute.mockImplementation(() => {
        callOrder.push('command');
        return Promise.resolve();
      });
      await handler.process(job);
      expect(callOrder).toEqual(['success', 'command']);
    });
  });

  describe('payment_failed job', () => {
    it('calls failPayment with bookingId', async () => {
      const job = makeJob('payment_failed', failedJobData);
      billingService.failPayment.mockResolvedValue(undefined);
      await handler.process(job);
      expect(billingService.failPayment).toHaveBeenCalledWith(
        failedJobData.bookingId,
      );
    });

    it('dont call commandBus.execute if payment_failed', async () => {
      const job = makeJob('payment_failed', failedJobData);
      billingService.failPayment.mockResolvedValue(undefined);
      await handler.process(job);
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('unknown job name', () => {
    it('unknown job → dont call billingService and commandBus', async () => {
      const job = makeJob('payment_unknown', {});
      await expect(handler.process(job)).resolves.toBe(undefined);
      expect(billingService.successPayment).not.toHaveBeenCalled();
      expect(billingService.failPayment).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });
});
