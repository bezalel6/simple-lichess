# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run build` - Full build process (clean, compile TypeScript, bundle with Rollup)
- `npm start` - Build and run the bundled output
- `npm run prepublishOnly` - Runs automatically before publishing to npm

## Architecture Overview

This is a TypeScript library for the Lichess API with universal Node.js/browser support through a sophisticated streaming architecture.

### Core Components

**Streaming Architecture:**
- `Fetch<T>` class implements dual streaming strategies:
  - **Node.js**: Uses native `https.request()` for true network streaming from socket
  - **Browser**: Uses `fetch()` with ReadableStream for browser streaming
- `SimpleStream<T>` provides unified streaming interface without JSON serialization
- Proper buffering handles PGN delimiter splitting (`\n\n` for games, `\n` for JSON APIs)

**Game Processing:**
- `Game` class parses PGN strings into structured data with move analysis
- Supports perspective-based analysis (`didIPlay`, `didOpponentPlay`)
- Handles dynamic coordinate conversion based on player color
- Move parsing splits PGN notation into individual white/black moves

**API Integration:**
- `fetchGames(username, options)` streams user games with filtering
- `fetchGame(gameId, myUsername)` fetches single game
- `fetchUserInfo(username)` retrieves user profile data
- `lookup()` and `lookupPlayer()` query opening databases

**Authentication:**
- `Ctrl` class handles OAuth 2.0 PKCE flow for authenticated requests
- Requires `setup({clientID, clientURL})` configuration before use

### Key Design Patterns

**Universal Compatibility:**
- Environment detection via `typeof window === "undefined"`
- Separate code paths for Node.js vs browser streaming
- External dependencies (`cross-fetch`, OAuth library) handled in Rollup config

**Streaming Buffer Management:**
- Maintains buffer for incomplete chunks
- Delimiter-aware splitting prevents partial PGN/JSON parsing
- Error handling for malformed chunks with graceful degradation

**Type Safety:**
- Strict TypeScript configuration with comprehensive error checking
- Interface definitions in `lookupTypes.ts` for API responses
- Generic streaming classes support type-safe object flow

### File Structure Notes

- `src/index.ts` - Main exports (uses `.js` extensions for compiled compatibility)  
- `Fetcher.ts` - High-level API functions and SimpleStream implementation
- `fetch.ts` - Low-level streaming HTTP client with dual environment support
- `Game.ts` - PGN parsing and chess-specific analysis methods
- `auth.ts` - OAuth authentication controller
- `UserData.ts` / `lookupTypes.ts` - TypeScript interfaces for API responses

### Build Process

1. **TypeScript compilation** (`tsc`) outputs to `out-tsc/` with declarations
2. **Rollup bundling** creates CommonJS bundle in `dist/`
3. External dependencies (OAuth, cross-fetch) remain unbundled
4. Node.js polyfills included for browser compatibility

### Critical Implementation Details

**Streaming Behavior:**
- Node.js implementation provides true streaming from network (memory efficient)
- Browser implementation uses fetch ReadableStream (actual browser streaming)
- Avoid `node-fetch` style "fake streaming" that buffers entire response

**PGN Processing:**
- Games separated by double newlines (`\n\n`) in Lichess stream responses  
- Buffer management essential for handling partial chunks across network boundaries
- Game constructor requires both PGN string and username for perspective analysis

**OAuth Flow:**
- Setup must be called before creating Ctrl instances
- Browser-based redirect flow with PKCE security
- Access tokens required for authenticated API calls (rate limit avoidance)