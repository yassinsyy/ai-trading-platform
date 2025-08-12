import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PricingGateway } from './pricing.gateway';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WsThrottlerGuard } from '../common/guards/ws-throttler.guard';

describe('PricingGateway', () => {
  let gateway: PricingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingGateway,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(() => ({ userId: 'test-user-id' })),
          },
        },
        {
          provide: WsJwtGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: WsThrottlerGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    gateway = module.get<PricingGateway>(PricingGateway);
    
    // Mock the WebSocket server
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      engine: {
        connectionThrottler: {
          canSubscribe: jest.fn(() => true),
          removeSubscription: jest.fn(),
          cleanupClient: jest.fn(),
        },
      },
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection with userId', () => {
    const mockSocket = {
      id: 'test-client-id',
      handshake: {
        auth: { userId: 'test-user-id' },
        query: {},
      },
    } as any;

    gateway.handleConnection(mockSocket);
    
    const clientInfo = (gateway as any).connectedClients.get('test-client-id');
    expect(clientInfo).toBeDefined();
    expect(clientInfo.userId).toBe('test-user-id');
  });

  it('should handle disconnection', () => {
    const mockSocket = {
      id: 'test-client-id',
      handshake: {
        auth: { userId: 'test-user-id' },
        query: {},
      },
    } as any;

    // First connect
    gateway.handleConnection(mockSocket);
    expect((gateway as any).connectedClients.size).toBe(1);

    // Then disconnect
    gateway.handleDisconnect(mockSocket);
    expect((gateway as any).connectedClients.size).toBe(0);
  });

  it('should handle subscription', () => {
    const mockSocket = {
      id: 'test-client-id',
      handshake: {
        auth: { userId: 'test-user-id' },
        query: {},
      },
      join: jest.fn(),
    } as any;

    // Connect first
    gateway.handleConnection(mockSocket);

    // Subscribe to marketplace
    const result = gateway.handleSubscribe(mockSocket, { marketplaceId: 'kaspi' });
    
    expect(result.success).toBe(true);
    expect(result.subscription).toBe('marketplace:kaspi');
    expect(mockSocket.join).toHaveBeenCalledWith('marketplace:kaspi');
  });

  it('should broadcast pricing updates', () => {
    const mockSocket = {
      id: 'test-client-id',
      handshake: {
        auth: { userId: 'test-user-id' },
        query: {},
      },
      join: jest.fn(),
    } as any;

    // Connect and subscribe
    gateway.handleConnection(mockSocket);
    gateway.handleSubscribe(mockSocket, { marketplaceId: 'kaspi' });

    // Broadcast update
    const update = {
      offerId: 'test-offer',
      oldPrice: 100,
      newPrice: 110,
      reasonCode: 'PRICE_APPLIED',
      timestamp: new Date(),
      marketplaceId: 'kaspi',
      productId: 'test-product',
    };

    gateway.broadcastPricingUpdate(update);
    
    expect(gateway.server.to).toHaveBeenCalledWith('marketplace:kaspi');
    expect(gateway.server.to).toHaveBeenCalledWith('pricing:general');
  });

  it('should get connected clients count', () => {
    const mockSocket = {
      id: 'test-client-id',
      handshake: {
        auth: { userId: 'test-user-id' },
        query: {},
      },
    } as any;

    expect(gateway.getConnectedClientsCount()).toBe(0);
    
    gateway.handleConnection(mockSocket);
    expect(gateway.getConnectedClientsCount()).toBe(1);
  });
});
