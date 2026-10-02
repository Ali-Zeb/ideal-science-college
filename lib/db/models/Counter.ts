import { Schema, model, models, type Model } from "mongoose";

interface CounterDoc {
  _id: string;
  seq: number;
}

/** Atomic sequence counters (e.g. application numbers per year). */
const CounterSchema = new Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = (models.Counter as Model<CounterDoc>) ?? model<CounterDoc>("Counter", CounterSchema);

/**
 * Atomically increments and returns the next value of a named sequence.
 * @param name - Sequence name, e.g. "application-2026".
 */
export async function nextSequence(name: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean();
  return doc?.seq ?? 1;
}
