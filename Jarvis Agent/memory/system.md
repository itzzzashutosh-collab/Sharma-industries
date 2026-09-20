# System Architecture & Flow Reference

## Overview
Jarvis Agent is the central AI orchestration brain for Sharma Industries.
It combines a lightweight fast-path engine (<1s response for standard queries) with deep reasoning via Hermes AI & OmniRoute local LLM.

## Components
1. **Classifier**: Extracts user intent, phone number match against CRM/dealers, and query type.
2. **Router**: Calculates complexity score.
   - Score < 0.5 -> Hermes Core (Fast rule-based response)
   - Score >= 0.5 -> Hermes Engine (Deep reasoning via OmniRoute LLM)
3. **Specialized Agents**:
   - `B2B Agent`: Wholesaler pricing, bulk order discounts, credit terms, MOQ.
   - `RM Agent`: Relationship management, grievance resolution, custom quotes.
   - `Ops Agent`: Order status, inventory availability, shipment dispatch, tracking.
4. **Validator**: Ensures price quotes follow business rules and communication is polite and concise.
5. **Memory Engine**: Persists conversation context and updates rolling execution logs.
