import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { handleWebhook } from './webhook/receive';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Webhook endpoint
app.post('/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));
    
    const result = await handleWebhook(req.body);
    
    console.log(`Webhook processed. Response: ${result.response}, Log ID: ${result.logId}`);
    
    // Return the response that would be sent back to WhatsApp
    res.json({
      message: result.response,
      log_id: result.logId,
      status: 'success'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      status: 'failed'
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`WhatsApp Webhook Router running on port ${PORT}`);
  console.log('Webhook endpoint: POST /webhook/whatsapp');
  console.log('Health check: GET /health');
});

export default app;