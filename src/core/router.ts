import { Role } from '../types';

export interface Handler {
  handle: (ctx: HandlerContext) => Promise<string>;
}

export interface HandlerContext {
  lid: string;
  message: string;
  role: Role;
  language: string;
  user: any;
}

export class Router {
  private handlers: Map<Role, Handler>;

  constructor() {
    this.handlers = new Map();
  }

  registerHandler(role: Role, handler: Handler): void {
    this.handlers.set(role, handler);
  }

  async route(ctx: HandlerContext): Promise<string> {
    const handler = this.handlers.get(ctx.role);
    if (handler) {
      return handler.handle(ctx);
    }
    return 'No handler registered for this role';
  }
}

export const getHandlerForRole = (role: Role): string => {
  const handlerMap: Record<Role, string> = {
    'OWNER': 'ownerHandler',
    'MANAGER': 'managerHandler',
    'ACCOUNTANT': 'accountantHandler',
    'SUPERVISOR': 'supervisorHandler',
    'OPERATOR': 'operatorHandler',
    'DEALER': 'dealerHandler',
    'VENDOR': 'vendorHandler',
    'CUSTOMER': 'customerHandler',
    'UNKNOWN': 'unknownHandler'
  };
  return handlerMap[role] || 'unknownHandler';
};