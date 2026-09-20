import { Handler } from '../core/router';
import { HandlerContext } from '../core/router';

export const unknownHandler: Handler = {
  async handle(ctx: HandlerContext): Promise<string> {
    return 'Aap register nahi ho, naam bata do';
  }
};