# Update AI Chat Agent Logic & Live Support Button

I will implement the rules from the **AI Chat Agent Core Conversation Guide** you provided, ensuring the agent uses this guide as its core logic while fetching specific data (like vacancies) from the Admin Knowledge base. I will also implement the "Live Support" action button exactly as you requested.

## Proposed Changes

### 1. Update Chatbot Frontend (`Chatbot.tsx`)
- I will modify the markdown renderer inside the chat window so that whenever the AI outputs a special link `[Live Support](#action-live-support)`, it will render as a beautiful, clickable button in the chat.
- Clicking this button will instantly trigger the `initiateHumanHandoff()` function (which opens the Live Support flow).

### 2. Update Backend AI Prompts (`api/chat.ts`)
- I will significantly upgrade the AI's core `systemPrompt` (for both RAG and static knowledge flows).
- **Behavioral Rules**: The AI will be instructed on how to handle candidate vs. employer workflows, how to combine core facts with retrieved vacancy data, and strictly forbidden from inventing salaries, deadlines, or false jobs (as per Section 7 of the PDF).
- **Handoff Trigger**: The AI will be instructed that whenever a user asks to speak to a human or consultant, it must respond affirmatively and output the `[Live Support](#action-live-support)` button.

### 3. Update Static Knowledge Base (`headhunters_public_knowledge.md`)
- I will populate the static knowledge base file with the exact approved responses from Sections 3, 4, and 5 of the PDF (e.g., "Who is Headhunters.lk?", "How much do your services cost?", "How can I submit my CV?").
- This ensures the AI always has the "Core Conversation Guide" facts memorized flawlessly.

## User Review Required
> [!IMPORTANT]
> - The AI will now strictly refuse to guess active vacancies or salaries if they are missing from the Admin Knowledge Base, exactly as the guide dictates.
> - The "Live Support" button will act as a direct gateway to the Tawk.to live chat flow.

Let me know if this implementation plan looks good and I will begin execution immediately!
