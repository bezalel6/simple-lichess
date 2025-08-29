# Simple Lichess API

A TypeScript library for interacting with the Lichess API, featuring game fetching, user data retrieval, OAuth authentication, and streaming support.

## Features

- 🎯 **Game Fetching** - Fetch games by user with filtering options
- 👤 **User Data** - Retrieve comprehensive user information  
- 🔐 **OAuth Authentication** - Secure authentication with PKCE flow
- 📊 **Database Lookup** - Access opening databases and player statistics
- 🌊 **Streaming Support** - Efficient handling of large datasets
- ⚡ **TypeScript** - Full type safety and IntelliSense support
- 🌐 **Universal** - Works in both Node.js and browser environments

## Installation

```bash
npm install simple-lichess-api
```

## Quick Start

### Fetching Games

```typescript
import { fetchGames, fetchGame } from 'simple-lichess-api';

// Fetch recent games for a user
const gameStream = fetchGames('hikaru', { 
  rated: 'both',
  maxGames: 10 
});

gameStream.listen(game => {
  console.log(`${game.white} vs ${game.black}: ${game.result}`);
  console.log(`Moves: ${game.moves}`);
});

// Fetch a specific game
const singleGame = fetchGame('gameId123', 'myUsername');
singleGame.listen(game => {
  console.log(`Did I win? ${game.didWin}`);
});
```

### User Information

```typescript
import { fetchUserInfo } from 'simple-lichess-api';

const userInfo = await fetchUserInfo('hikaru');
console.log(`Rating: ${userInfo.perfs.blitz.rating}`);
console.log(`Games played: ${userInfo.count.all}`);
```

### OAuth Authentication

```typescript
import { setup, Ctrl } from 'simple-lichess-api';

// Setup OAuth (call once)
setup({
  clientID: 'your-app-name',
  clientURL: 'http://localhost:3000'
});

// Create auth controller
const auth = new Ctrl();

// Initialize authentication
await auth.init();

// Login (redirects to Lichess)
if (!auth.accessContext) {
  await auth.login();
}

// Use authenticated requests
const authenticatedGames = fetchGames('username', {
  rated: 'both',
  accessToken: auth.accessContext.token.value
});
```

### Opening Database Lookup

```typescript
import { lookup, lookupPlayer } from 'simple-lichess-api';

// Lookup position in masters database
const position = lookup({
  database: 'masters',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
});

position.listen(data => {
  console.log(`White wins: ${data.white}, Draws: ${data.draws}, Black wins: ${data.black}`);
  console.log('Popular moves:', data.moves.map(m => m.san));
});

// Player-specific opening stats
const playerStats = lookupPlayer({
  player: 'hikaru',
  color: 'white',
  fen: 'starting-position-fen'
});

playerStats.listen(stats => {
  console.log(`Player performance: ${stats.moves[0]?.performance}`);
});
```

### Game Analysis

```typescript
// The Game class provides useful methods for analysis
gameStream.listen(game => {
  console.log(`Playing as: ${game.isWhite ? 'White' : 'Black'}`);
  console.log(`My moves: ${game.myMoves.join(', ')}`);
  console.log(`Opponent moves: ${game.opponentMoves.join(', ')}`);
  
  // Check if specific moves were played
  if (game.didIPlay('e4')) {
    console.log('I played e4!');
  }
  
  if (game.didOpponentPlay('e5', true)) { // exact match
    console.log('Opponent responded with e5');
  }
  
  console.log(`Game outcome: ${game.perspectiveResult}`);
});
```

### Streaming Utilities

```typescript
import { promisifyStream } from 'simple-lichess-api';

// Convert stream to promise for single results
const gamePromise = promisifyStream(fetchGame('gameId', 'username'));
const game = await gamePromise;
console.log(game.description);

// Handle errors and stream completion
gameStream.onError(error => {
  console.error('Stream error:', error);
});

gameStream.onEnd(() => {
  console.log('Stream completed');
});
```

## API Reference

### Functions

- `fetchGames(username, options)` - Stream user's games
- `fetchGame(gameId, myUsername)` - Fetch single game  
- `fetchUserInfo(username)` - Get user profile and stats
- `lookup(params)` - Query opening database
- `lookupPlayer(params)` - Get player-specific opening stats
- `setup(config)` - Configure OAuth authentication
- `promisifyStream(stream)` - Convert stream to promise

### Classes

- `Game` - Parsed PGN game with chess analysis methods
  - Properties: `white`, `black`, `result`, `moves`, `myMoves`, `opponentMoves`
  - Methods: `didWin`, `didLose`, `didDraw`, `didIPlay()`, `didOpponentPlay()`
- `Ctrl` - OAuth authentication controller with PKCE flow
  - Methods: `init()`, `login()`, `logout()`
  - Properties: `accessContext`, `error`
- `SimpleStream<T>` - Universal streaming interface
  - Methods: `listen()`, `onError()`, `onEnd()`

### Types

- `UserInfo` - Complete user profile with ratings and statistics
- `PositionJson` - Opening database position data with moves and games
- `PlayerOpenings` - Player-specific opening statistics
- `FetchOptions` - Configuration for API requests
- `GamesOptions` - Game fetching parameters
- `LookupParams` - Database lookup configuration

### Streaming Architecture

**Node.js**: Uses native `https.request()` for true network streaming with minimal memory usage.

**Browser**: Uses `fetch()` with ReadableStream for efficient browser streaming.

**Data Flow**: Network → Buffer → Delimiter Split → Object Construction → Stream Emission

## Requirements

- Node.js 16+ or modern browser with fetch support
- TypeScript 4.5+ (for TypeScript projects)

## License

MIT

## Contributing

Issues and pull requests welcome! This library focuses on core Lichess API functionality with clean, type-safe interfaces.
