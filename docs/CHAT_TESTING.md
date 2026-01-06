# Chat Functionality Testing Guide

This guide helps you test the chat functionality in Aura's visual editor.

## Prerequisites

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Verify the server is running**:
   - Open http://localhost:3000 in your browser
   - You should see the "Mission Control" dashboard

## Manual Testing Steps

### 1. Open the Chat Dialog

1. Navigate to http://localhost:3000
2. Look for the **"Talk to Aura"** button in the top right (has a sparkles icon ✨)
3. Click the button
4. **Expected**: A chat dialog should open with the greeting: "Hello! I am Aura. What task would you like to build today?"

### 2. Test Basic Chat Interaction

1. In the chat dialog, you should see:
   - A greeting message from Aura
   - An input field with placeholder "Describe a new task..."
   - A send button (paper plane icon)

2. Type a message: `Hello, can you help me?`
3. Click the send button or press Enter
4. **Expected**: 
   - Your message appears in the chat
   - A loading indicator shows "Thinking..."
   - A response from Aura appears

### 3. Test Task Creation via Chat

1. Type a task request: `Add user authentication feature`
2. Send the message
3. **Expected**:
   - Aura processes the request
   - Either creates a task (shows "I've created a new task...") or responds conversationally
   - If a task is created, it should appear on the dashboard

### 4. Test Chat Dialog Closing

1. With the chat dialog open, try:
   - Click the **X button** in the top right of the dialog
   - Press the **Escape key**
2. **Expected**: The dialog closes

### 5. Test Multiple Messages

1. Send several messages in sequence
2. **Expected**: 
   - Messages appear in order
   - Chat auto-scrolls to show the latest message
   - Each message is clearly labeled (user vs assistant)

### 6. Test Error Handling

1. If the API is down or returns an error, send a message
2. **Expected**: 
   - Error message appears: "Something went wrong. Please try again."
   - Chat remains functional

## Automated Testing

Run the automated chat tests:

```bash
# Run all chat tests (requires dev server running)
npm run test:ui -- src/__tests__/ui/chat.test.ts

# Run visual test (opens browser)
npx playwright test src/__tests__/ui/chat-manual.test.ts --headed
```

## What to Check

### ✅ Chat Dialog
- [ ] Dialog opens when clicking "Talk to Aura" button
- [ ] Dialog shows initial greeting message
- [ ] Dialog can be closed (X button or Escape key)
- [ ] Dialog has proper styling and layout

### ✅ Message Input
- [ ] Input field is visible and functional
- [ ] Can type messages
- [ ] Send button is enabled when input has text
- [ ] Send button is disabled when input is empty
- [ ] Input is disabled while loading

### ✅ Message Display
- [ ] User messages appear correctly
- [ ] Assistant messages appear correctly
- [ ] Messages are properly formatted
- [ ] Chat auto-scrolls to latest message
- [ ] Loading indicator shows when processing

### ✅ Task Creation
- [ ] Can create tasks via chat
- [ ] Task creation confirmation appears
- [ ] Created tasks appear on dashboard
- [ ] Dashboard refreshes after task creation

### ✅ Error Handling
- [ ] Errors are displayed gracefully
- [ ] Chat remains functional after errors
- [ ] User can retry after errors

## Common Issues

### Chat Dialog Doesn't Open
- Check browser console for errors
- Verify React is properly loaded
- Check that the button click handler is working

### Messages Don't Send
- Check network tab for API calls to `/api/agent/interact`
- Verify API endpoint is working
- Check browser console for errors

### No Response from Aura
- Verify AI API keys are configured (GROQ_API_KEY or ANTHROPIC_API_KEY)
- Check server logs for errors
- Verify meta-agent is working

## Screenshots

When running the visual test, screenshots are saved to:
- `test-results/chat-initial.png` - Initial page state
- `test-results/chat-dialog-open.png` - Dialog opened
- `test-results/chat-typed.png` - Message typed
- `test-results/chat-response.png` - Response received
- `test-results/chat-closed.png` - Dialog closed

## Next Steps

After verifying chat functionality:
1. Test task creation workflows
2. Test approval flows
3. Test execution workflows
4. Review the full test suite in `src/__tests__/`

