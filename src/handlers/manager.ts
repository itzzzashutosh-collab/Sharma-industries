import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const managerHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Manager request received';
  }
};