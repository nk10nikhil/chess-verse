"use client"

export async function connectToGame(gameId: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    // Instead of directly checking for cookies, we'll rely on the API endpoint
    // to verify authentication status

    // Check authentication using the API endpoint
    checkAuthentication()
      .then(isAuthenticated => {
        if (!isAuthenticated) {
          console.error("Game socket: Authentication failed");
          reject(new Error("Not authenticated"))
          return
        }

        console.log("Game socket: Authentication successful, creating socket");
        // Authenticated, create the socket connection
        const socket = simulateWebSocket(gameId)

        socket.onopen = () => {
          console.log("Game socket: Connection opened");
          // Explicitly request initial state after connection is established
          socket.send(JSON.stringify({ type: "requestInitialState" }));
          resolve(socket)
        }

        socket.onerror = (error) => {
          console.error("Game socket: Connection error", error);
          reject(error)
        }
      })
      .catch(error => {
        console.error("Game socket: Authentication check error", error);
        reject(new Error("Authentication check failed"))
      })
  })
}

// Helper function to check authentication status
async function checkAuthentication(): Promise<boolean> {
  try {
    // Make a request to your API to check authentication status
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include' // This ensures cookies are sent with the request
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.authenticated
  } catch (error) {
    console.error("Authentication check failed:", error)
    return false
  }
}

export async function makeMove(gameId: string, from: string, to: string): Promise<boolean> {
  // In a real app, this would send a move via the WebSocket
  // For this example, we'll simulate the move
  return true
}

export async function resignGame(gameId: string): Promise<boolean> {
  // In a real app, this would send a resignation via the WebSocket
  // For this example, we'll simulate the resignation
  return true
}

// This is a simulation of a WebSocket for the example
// In a real app, you would connect to a real WebSocket server
function simulateWebSocket(gameId: string): WebSocket {
  const mockSocket: any = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    readyToSendInitialState: false,
    initStateSent: false,
    send: (data: string) => {
      const parsedData = JSON.parse(data)

      // Simulate responses based on the message type
      if (parsedData.type === "getPossibleMoves") {
        const position = parsedData.position
        // Simulate getting possible moves
        setTimeout(() => {
          if (mockSocket.onmessage) {
            // Return some sample possible moves
            const possibleMoves = simulatePossibleMoves(position)
            mockSocket.onmessage({
              data: JSON.stringify({
                type: "possibleMoves",
                moves: possibleMoves,
              }),
            })
          }
        }, 100)
      } else if (parsedData.type === "move") {
        // Simulate making a move
        setTimeout(() => {
          if (mockSocket.onmessage) {
            try {
              // Return updated game state
              const newState = simulateGameState(gameId, parsedData.from, parsedData.to)
              console.log("Game socket: Move made from", parsedData.from, "to", parsedData.to);
              mockSocket.onmessage({
                data: JSON.stringify({
                  type: "gameState",
                  state: newState,
                }),
              })
            } catch (error) {
              console.error("Game socket: Error processing move:", error);
              mockSocket.onmessage({
                data: JSON.stringify({
                  type: "error",
                  message: "Failed to process move",
                }),
              })
            }
          }
        }, 200)
      } else if (parsedData.type === "resign") {
        // Simulate resigning
        setTimeout(() => {
          if (mockSocket.onmessage) {
            // Return updated game state with resignation
            const newState = simulateGameState(gameId, null, null, true)
            mockSocket.onmessage({
              data: JSON.stringify({
                type: "gameState",
                state: newState,
              }),
            })
          }
        }, 200)
      } else if (parsedData.type === "requestInitialState") {
        // Client is explicitly requesting the initial state
        setTimeout(() => {
          if (mockSocket.onmessage) {
            console.log("Game socket: Client requested initial state");
            try {
              const initialState = simulateGameState(gameId);
              console.log("Game socket: Sending initial state on request, status:", initialState.status);

              mockSocket.onmessage({
                data: JSON.stringify({
                  type: "gameState",
                  state: initialState,
                }),
              });
              mockSocket.initStateSent = true;
            } catch (error) {
              console.error("Game socket: Error generating initial state:", error);
              mockSocket.onmessage({
                data: JSON.stringify({
                  type: "error",
                  message: "Failed to initialize game state",
                }),
              });
            }
          }
        }, 100);
      }
    },
    close: () => {
      console.log("Game socket: Socket closed manually");
      if (mockSocket.onclose) {
        mockSocket.onclose()
      }
    },
  }

  // Fix timing issue - make sure onopen happens first, and automatically send initial state
  setTimeout(() => {
    console.log("Game socket: Simulating connection open");
    if (mockSocket.onopen) {
      mockSocket.onopen()
      mockSocket.readyToSendInitialState = true;

      // Automatically send initial state after connection is established
      console.log("Game socket: Automatically sending initial state");
      setTimeout(() => {
        if (mockSocket.onmessage && !mockSocket.initStateSent) {
          try {
            const initialState = simulateGameState(gameId);
            console.log("Game socket: Sending initial state automatically, status:", initialState.status);

            mockSocket.onmessage({
              data: JSON.stringify({
                type: "gameState",
                state: initialState,
              }),
            });
            mockSocket.initStateSent = true;
          } catch (error) {
            console.error("Game socket: Error generating initial state:", error);
            if (mockSocket.onmessage) {
              mockSocket.onmessage({
                data: JSON.stringify({
                  type: "error",
                  message: "Failed to initialize game state",
                }),
              });
            }
          }
        }
      }, 150);
    }
  }, 100);

  return mockSocket as WebSocket
}

function simulatePossibleMoves(position: string): string[] {
  // This is a simplified simulation - in a real app, this would be based on actual chess rules
  const [file, rank] = position.split("")
  const fileIndex = file.charCodeAt(0) - 97
  const rankIndex = 8 - Number.parseInt(rank)

  // Generate some sample moves
  const moves: string[] = []

  // Simulate pawn moves
  if (rank === "2") {
    moves.push(`${file}3`)
    moves.push(`${file}4`)
  } else if (rank === "7") {
    moves.push(`${file}6`)
    moves.push(`${file}5`)
  }

  // Add some diagonal moves for capturing
  if (fileIndex > 0) {
    if (rank === "2") moves.push(`${String.fromCharCode(fileIndex + 96)}3`)
    if (rank === "7") moves.push(`${String.fromCharCode(fileIndex + 96)}6`)
  }

  if (fileIndex < 7) {
    if (rank === "2") moves.push(`${String.fromCharCode(fileIndex + 98)}3`)
    if (rank === "7") moves.push(`${String.fromCharCode(fileIndex + 98)}6`)
  }

  return moves
}

// Add cache to store game states
const gameStates: Record<string, any> = {};

function simulateGameState(
  gameId: string,
  fromPosition?: string | null,
  toPosition?: string | null,
  resigned = false,
): any {
  // Check if we already have a game state for this game
  if (!gameStates[gameId]) {
    // First time initialization
    const board = initializeChessBoard();
    gameStates[gameId] = {
      board,
      currentTurn: "white", // White always starts in chess
      playerColor: Math.random() > 0.5 ? "white" : "black", // This is fixed for the player during the game
      status: "playing",
      winner: null,
      check: false,
      lastMove: null,
    };
  }

  const currentState = gameStates[gameId];

  // If a move was made, update the board and switch turns
  if (fromPosition && toPosition) {
    const [fromFile, fromRank] = fromPosition.split("");
    const [toFile, toRank] = toPosition.split("");

    const fromFileIndex = fromFile.charCodeAt(0) - 97;
    const fromRankIndex = 8 - Number.parseInt(fromRank);
    const toFileIndex = toFile.charCodeAt(0) - 97;
    const toRankIndex = 8 - Number.parseInt(toRank);

    // Get the piece from the source position
    const piece = currentState.board[fromRankIndex][fromFileIndex].piece;

    if (!piece) {
      console.error("No piece found at position:", fromPosition);
      return currentState;
    }

    // Move the piece
    currentState.board[toRankIndex][toFileIndex].piece = piece;
    currentState.board[fromRankIndex][fromFileIndex].piece = null;

    // Update last move
    currentState.lastMove = { from: fromPosition, to: toPosition };

    // Switch turns properly
    currentState.currentTurn = currentState.currentTurn === "white" ? "black" : "white";

    // Randomly set check state for demonstration (in a real app this would be calculated)
    currentState.check = Math.random() > 0.8;

    console.log(`Move from ${fromPosition} to ${toPosition} completed. Current turn: ${currentState.currentTurn}`);
  }

  // Handle resignation
  if (resigned) {
    currentState.status = "checkmate";
    // The winner is the opposite of the current player (since they resigned)
    currentState.winner = currentState.currentTurn === "white" ? "black" : "white";
  }

  return { ...currentState };
}

function initializeChessBoard() {
  // Create an 8x8 chess board with pieces in their starting positions
  const board = Array(8)
    .fill(null)
    .map((_, rankIndex) =>
      Array(8).fill(null).map((_, fileIndex) => {
        const file = String.fromCharCode(97 + fileIndex);
        const rank = 8 - rankIndex;
        return { piece: null, position: `${file}${rank}` };
      })
    );

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i].piece = { type: "pawn", color: "black" };
    board[6][i].piece = { type: "pawn", color: "white" };
  }

  // Set up rooks
  board[0][0].piece = { type: "rook", color: "black" };
  board[0][7].piece = { type: "rook", color: "black" };
  board[7][0].piece = { type: "rook", color: "white" };
  board[7][7].piece = { type: "rook", color: "white" };

  // Set up knights
  board[0][1].piece = { type: "knight", color: "black" };
  board[0][6].piece = { type: "knight", color: "black" };
  board[7][1].piece = { type: "knight", color: "white" };
  board[7][6].piece = { type: "knight", color: "white" };

  // Set up bishops
  board[0][2].piece = { type: "bishop", color: "black" };
  board[0][5].piece = { type: "bishop", color: "black" };
  board[7][2].piece = { type: "bishop", color: "white" };
  board[7][5].piece = { type: "bishop", color: "white" };

  // Set up queens
  board[0][3].piece = { type: "queen", color: "black" };
  board[7][3].piece = { type: "queen", color: "white" };

  // Set up kings
  board[0][4].piece = { type: "king", color: "black" };
  board[7][4].piece = { type: "king", color: "white" };

  return board;
}
