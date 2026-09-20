import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const supervisorHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Supervisor request received';
  }
};