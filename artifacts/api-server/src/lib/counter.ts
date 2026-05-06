import { MongoClient, Collection } from "mongodb";

/* ── Connection state ─────────────────────────────────────── */
type MongoState = "idle" | "connecting" | "connected" | "no-uri" | "failed";

let _state: MongoState = "idle";
let _col: Collection<{ _id: string; value: number }> | null = null;
let _connectPromise: Promise<void> | null = null;

/* ── In-memory fallback counters ─────────────────────────── */
let _localCount = 0;
let _success = 0;
let _error = 0;

/* ── MongoDB connection ───────────────────────────────────── */
async function doConnect(): Promise<void> {
  const uri = (process.env["MONGODB_URI"] ?? "").trim();

  if (!uri) {
    _state = "no-uri";
    console.log(
      "[TubeFetch] ⚠  MONGODB_URI is not set — ApiCount is in-memory only (resets on restart)",
    );
    return;
  }

  _state = "connecting";
  console.log("[TubeFetch] 🔄 Connecting to MongoDB...");

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();

    const col = client
      .db("tubefetch")
      .collection<{ _id: string; value: number }>("counters");

    // Ensure the counter document exists
    await col.updateOne(
      { _id: "apiCount" },
      { $setOnInsert: { value: 0 } },
      { upsert: true },
    );

    _col = col;
    _state = "connected";
    console.log(
      "[TubeFetch] ✅ Successfully connected to MongoDB — ApiCount is now persistent",
    );
  } catch (err) {
    _state = "failed";
    _col = null;
    console.error(
      "[TubeFetch] ❌ MongoDB connection failed:",
      (err as Error).message,
    );
    console.log(
      "[TubeFetch] ⚠  Falling back to in-memory ApiCount (not persistent)",
    );
  }
}

function ensureConnected(): Promise<void> {
  if (_state === "idle") {
    _connectPromise = doConnect();
  }
  return _connectPromise ?? Promise.resolve();
}

/* Eagerly connect at module load so logs appear at startup */
ensureConnected();

/* ── Public API ───────────────────────────────────────────── */
export async function increment(): Promise<number> {
  _localCount++;
  await ensureConnected();
  if (!_col) return _localCount;
  try {
    const doc = await _col.findOneAndUpdate(
      { _id: "apiCount" },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "after" },
    );
    return doc?.value ?? _localCount;
  } catch (err) {
    console.error("[TubeFetch] MongoDB increment error:", (err as Error).message);
    return _localCount;
  }
}

export async function getCount(): Promise<number> {
  await ensureConnected();
  if (!_col) return _localCount;
  try {
    const doc = await _col.findOne({ _id: "apiCount" });
    return doc?.value ?? _localCount;
  } catch {
    return _localCount;
  }
}

export function recordSuccess(): void { _success++; }
export function recordError(): void   { _error++;   }
export function getSuccess(): number  { return _success; }
export function getError():   number  { return _error;   }

export function getMongoStatus(): MongoState { return _state; }
