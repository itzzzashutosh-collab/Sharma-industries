import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const dealerHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Dealer request received';
  }
};