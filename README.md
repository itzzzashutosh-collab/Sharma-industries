# Hermes WhatsApp Routing (Phase 1 — Role Only)

## Overview
Minimal WhatsApp webhook router that routes messages based on LID (phone number) → user → role → handler.

## Architecture
- **LID Extraction**: Extracts WhatsApp `from` field as LID (primary key)
- **User Resolution**: Looks up LID in `data/users.csv` to get role and language
- **Routing**: Maps role to handler (OWNER→ownerHandler, DEALER→dealerHandler, etc.)
- **Logging**: All messages logged to `data/messages_log.csv`
- **Unknown LID**: Falls back to unknownHandler with registration prompt

## Project Structure
```
src/
├── server.ts              # Express server setup
├── webhook/receive.ts     # Webhook receiver and processor
├── core/
│   ├── normalizer.ts      # Extract LID and message from payload
│   ├── userResolver.ts    # LID → user from CSV
│   └── router.ts          # Role → handler mapping
├── handlers/              # Handler stubs (9 roles)
├── storage/csvStore.ts    # CSV read/write operations
└── types/index.ts         # Type definitions

data/
├── users.csv              # User database (LID, name, role, language, active, created_at)
└── messages_log.csv       # Message log (id, lid, role, raw_message, routed_to, status, created_at)
```

## CSV Schemas

### users.csv
```csv
lid,name,role,language,active,created_at
1234567890abcdef,Rajesh Kumar,OWNER,hinglish,true,2026-01-15T10:00:00Z
```

### messages_log.csv
```csv
id,lid,role,raw_message,routed_to,status,created_at
1789645665791,1234567890abcdef,UNKNOWN,Test message from owner,ownerHandler,processed,2026-09-17T11:47:45.790Z
```

## Roles and Handlers
| Role | Handler | Response |
|------|---------|----------|
| OWNER | ownerHandler | "Owner command received" |
| MANAGER | managerHandler | "Manager request received" |
| ACCOUNTANT | accountantHandler | "Finance request received" |
| SUPERVISOR | supervisorHandler | "Supervisor request received" |
| OPERATOR | operatorHandler | "Operator request received" |
| DEALER | dealerHandler | "Dealer request received" |
| VENDOR | vendorHandler | "Vendor request received" |
| CUSTOMER | customerHandler | "Customer request received" |
| UNKNOWN | unknownHandler | "Aap register nahi ho, naam bata do" |

## Usage
1. Start the server: `node dist/server.js`
2. Send POST webhook to `http://localhost:3000/webhook`
3. Webhook payload format:
```json
{
  "from": "1234567890abcdef",
  "body": {
    "text": "Your message here"
  }
}
```

## Testing
Run the test suite:
```bash
node test-webhook.js
```

## Features
- ✅ LID extraction from WhatsApp webhook `from` field
- ✅ CSV-based user storage (no SQL/DB required)
- ✅ Role-based routing to handler stubs
- ✅ Unknown LID handling with registration prompt
- ✅ Message logging to CSV
- ✅ TypeScript with proper type safety
- ✅ No LLM, no intent detection, no reply templates

## Dependencies
- express: Web server
- body-parser: Request body parsing
- csv-parser: CSV file operations
