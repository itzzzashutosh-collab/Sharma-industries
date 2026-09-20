import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const operatorHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Operator request received';
  }
};