import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const vendorHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Vendor request received';
  }
};