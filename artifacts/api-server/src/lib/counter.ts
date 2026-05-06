import { MongoClient, Collection } from "mongodb";

/* ── Connection state ─────────────────────────────────────── */
type MongoState = "idle" | "connecting" | "connected" | "no-uri" | "failed";

interface CounterDoc {
  _id: string;
  value: number;
  successCount: number;
  errorCount: number;
}

let _state: MongoState = "idle";
let _col: Collection<CounterDoc> | null = null;
let _connectPromise: Promise<void> | null = null;

/* ── In-memory fallback counters ─────────────────────────── */
let _localCount = 0;
let _localSuccess = 0;
let _localError = 0;

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

    const col = client.db("tubefetch").collection<CounterDoc>("counters");

    /* Ensure the counter document exists with all three fields */
    await col.updateOne(
      { _id: "apiCount" },
      { $setOnInsert: { value: 0, successCount: 0, errorCount: 0 } },
      { upsert: true },
    );

    /* Migrate older documents that may lack successCount / errorCount */
    await col.updateOne(
      { _id: "apiCount", successCount: { $exists: false } },
      { $set: { successCount: 0, errorCount: 0 } },
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

export async function getAllCounts(): Promise<{ total: number; successCount: number; errorCount: number }> {
  await ensureConnected();
  if (!_col) return { total: _localCount, successCount: _localSuccess, errorCount: _localError };
  try {
    const doc = await _col.findOne({ _id: "apiCount" });
    return {
      total:        doc?.value        ?? _localCount,
      successCount: doc?.successCount ?? _localSuccess,
      errorCount:   doc?.errorCount   ?? _localError,
    };
  } catch {
    return { total: _localCount, successCount: _localSuccess, errorCount: _localError };
  }
}

export async function getCount(): Promise<number> {
  const { total } = await getAllCounts();
  return total;
}

export function recordSuccess(): void {
  _localSuccess++;
  if (!_col) return;
  _col
    .updateOne({ _id: "apiCount" }, { $inc: { successCount: 1 } }, { upsert: true })
    .catch((err) =>
      console.error("[TubeFetch] MongoDB recordSuccess error:", (err as Error).message),
    );
}

export function recordError(): void {
  _localError++;
  if (!_col) return;
  _col
    .updateOne({ _id: "apiCount" }, { $inc: { errorCount: 1 } }, { upsert: true })
    .catch((err) =>
      console.error("[TubeFetch] MongoDB recordError error:", (err as Error).message),
    );
}

export function getMongoStatus(): MongoState { return _state; }
