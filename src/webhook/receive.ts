import { normalizeWebhook, extractLID, extractMessage } from '../core/normalizer';
import { UserResolver } from '../core/userResolver';
import { CSVStore } from '../storage/csvStore';
import { Router, getHandlerForRole, HandlerContext } from '../core/router';
import { MessageLog } from '../types';
import { ownerHandler } from '../handlers/owner';
import { managerHandler } from '../handlers/manager';
import { accountantHandler } from '../handlers/accountant';
import { supervisorHandler } from '../handlers/supervisor';
import { operatorHandler } from '../handlers/operator';
import { dealerHandler } from '../handlers/dealer';
import { vendorHandler } from '../handlers/vendor';
import { customerHandler } from '../handlers/customer';
import { unknownHandler } from '../handlers/unknown';

export class WebhookReceiver {
  private userStore: CSVStore;
  private logStore: CSVStore;
  private userResolver: UserResolver;
  private router: Router;

  constructor() {
    this.userStore = new CSVStore('./data/users.csv');
    this.logStore = new CSVStore('./data/messages_log.csv');
    this.userResolver = new UserResolver(this.userStore);
    this.router = new Router();
    
    // Register all handlers
    this.router.registerHandler('OWNER', ownerHandler);
    this.router.registerHandler('MANAGER', managerHandler);
    this.router.registerHandler('ACCOUNTANT', accountantHandler);
    this.router.registerHandler('SUPERVISOR', supervisorHandler);
    this.router.registerHandler('OPERATOR', operatorHandler);
    this.router.registerHandler('DEALER', dealerHandler);
    this.router.registerHandler('VENDOR', vendorHandler);
    this.router.registerHandler('CUSTOMER', customerHandler);
    this.router.registerHandler('UNKNOWN', unknownHandler);
  }

  async processWebhook(payload: any): Promise<{ response: string, logId: string }> {
    // Step 1: Extract LID and message
    const lid = extractLID(payload);
    const message = extractMessage(payload);
    
    // Step 2: Get user from CSV
    const user = this.userResolver.getUserByLID(lid);
    
    // Step 3: Determine role
    const role: any = user ? user.role : 'UNKNOWN';
    const language = user ? user.language : 'english';
    
    // Step 4: Create handler context
    const context: HandlerContext = {
      lid,
      message,
      role,
      language,
      user
    };
    
    // Step 5: Route to appropriate handler
    const response = await this.router.route(context);
    
    // Step 6: Log the message
    const logData: Omit<MessageLog, 'id'> = {
      lid,
      role,
      raw_message: message,
      routed_to: getHandlerForRole(role),
      status: 'processed',
      created_at: new Date().toISOString()
    };
    
    const logId = this.logStore.appendMessageLog(logData);
    
    return {
      response,
      logId
    };
  }
}

// Main webhook handler function
export async function handleWebhook(payload: any) {
  const receiver = new WebhookReceiver();
  return receiver.processWebhook(payload);
}
