import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      NODE_ENV: 'test',
      APP_URL: 'http://localhost:3001',
    };
    return map[key];
  }),
};

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email without throwing (jsonTransport)', async () => {
    await expect(
      service.send({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Hello</p>',
      }),
    ).resolves.not.toThrow();
  });

  it('should send password reset email', async () => {
    await expect(
      service.sendPasswordReset('test@example.com', 'abc123'),
    ).resolves.not.toThrow();
  });

  it('should send magic link email', async () => {
    await expect(
      service.sendMagicLink('test@example.com', 'magic-token'),
    ).resolves.not.toThrow();
  });
});
