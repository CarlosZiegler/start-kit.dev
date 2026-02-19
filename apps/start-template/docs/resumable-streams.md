# Resumable Chat Streams

Chat streams that survive page refresh using Redis with graceful degradation.

## Overview

When a user refreshes the page mid-stream, the chat picks up from the exact character where it left off. If Redis isn't configured, chat works normally without resume capability.

## Architecture

```
INITIAL REQUEST:
Client → POST /api/chat (with conversationId)
Server → Generate streamId, wrap in resumable stream
       → Persist chunks to Redis via resumable-stream
       → Return X-Stream-Id header
Client → Save streamId + charOffset to sessionStorage

PAGE REFRESH:
Client → Check sessionStorage for active stream
       → GET /api/chat/resume?streamId=X&skipChars=Y
Server → Resume stream from character offset
Client → Continue rendering from exact position
```

## Quick Start

### 1. Configure Redis (optional)

Add `REDIS_URL` to your environment:

```env
REDIS_URL=redis://localhost:6379
```

Without Redis, chat works normally—just not resumable.

### 2. Use the Hook

```tsx
import { useResumableChat } from "@/lib/chat/use-resumable-chat";

function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isStreaming,
    isResuming,
    clearChat,
  } = useResumableChat();

  return (
    <div>
      {isResuming && <div>Resuming stream...</div>}
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isStreaming}>Send</button>
      </form>
      <button onClick={clearChat} type="button">Clear</button>
    </div>
  );
}
```

## API Reference

### Client

#### `useResumableChat()`

Hook wrapping TanStack's `useChat` with resume capability.

Returns:
- All `useChat` properties (`messages`, `input`, `handleSubmit`, etc.)
- `isInitialized` - `true` after initial load/restore
- `isResuming` - `true` during stream resume
- `isStreaming` - `true` if loading or resuming
- `clearChat()` - Clear messages and session storage

#### `parseSSEResponse(response, conversationId)`

Parse SSE response, tracking character offset for resume.

#### `resumeStream(baseUrl, abortSignal?)`

Async generator that resumes from last known position.

#### `hasActiveStream()`

Check if there's an active stream to resume.

### Server

#### `getStreamContext()`

Get the singleton resumable stream context. Returns `null` if Redis unavailable.

```ts
const ctx = await getStreamContext();
if (ctx) {
  const stream = await ctx.createNewResumableStream(streamId, () => sourceStream);
}
```

### Endpoints

#### `POST /api/chat`

Create new chat stream.

Request:
```json
{
  "messages": [...],
  "conversationId": "optional-uuid"
}
```

Response Headers:
- `X-Stream-Id` - UUID for resume (empty if no Redis)
- `X-Conversation-Id` - Conversation UUID

#### `GET /api/chat/resume`

Resume an active stream.

Query params:
- `streamId` - Stream UUID from initial request
- `skipChars` - Character offset to skip

Returns:
- `204` - Stream doesn't exist or already completed
- SSE stream from specified offset

## Files

| File | Purpose |
|------|---------|
| `src/lib/chat/resumable-connection.ts` | Client-side SSE parsing and sessionStorage |
| `src/lib/chat/use-resumable-chat.ts` | React hook with auto-resume |
| `src/lib/chat/stream-context.ts` | Server-side Redis/resumable-stream setup |
| `src/routes/api/chat/index.ts` | Chat endpoint with resumable wrapping |
| `src/routes/api/chat/resume.ts` | Resume endpoint |

## How It Works

### Storage

**sessionStorage** (client):
- `chat:active-stream` - `{ streamId, conversationId, charOffset }`
- `chat:messages` - Serialized `UIMessage[]`

**Redis** (server):
- Managed by `resumable-stream` package
- Auto-expires after stream completion

### Flow

1. **New stream**: Client POSTs to `/api/chat`, server wraps stream with `createNewResumableStream`, returns `X-Stream-Id`

2. **Streaming**: Client parses SSE, tracks `charOffset` in sessionStorage, saves messages

3. **Page refresh**: `useResumableChat` detects active stream, calls resume endpoint with `skipChars`

4. **Resume**: Server reads from Redis starting at offset, streams remaining chunks

5. **Completion**: Server closes connection, client clears sessionStorage

### Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| No `REDIS_URL` | Chat works, `X-Stream-Id` header empty |
| Redis connection fails | Logs warning, falls back to non-resumable |
| Stream not found on resume | Returns 204, client clears storage |
| Stream completed before resume | Returns 204 |

## Dependencies

- `resumable-stream` - Core stream persistence logic
- `@tanstack/ai-react` - Chat hook foundation
- Bun's native `RedisClient` - Redis connection
