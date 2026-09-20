import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const accountantHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Finance request received';
  }
};