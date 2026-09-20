import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const ownerHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Owner command received';
  }
};