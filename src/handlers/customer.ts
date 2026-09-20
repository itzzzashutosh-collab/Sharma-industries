import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const customerHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Customer request received';
  }
};