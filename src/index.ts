import {ic, nat64, Opt, Record, Result, StableBTreeMap, Vec, match, $query, $update  } from "azle";
import { v4 as uuidv4 } from "uuid";

// Define the Message type

type Entry = Record<{
  id: string;
  author: string;
  title: string;
  body: string;
  // cost: number;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
  action: string;
  rewardPoints: number;
}>;

type EntryPayload = Record<{
  author: string;
  title: string;
  body: string;
  action: string;
  rewardPoints: number;}>;
type RedeemableReward = Record<{
  title: string;
  cost: number;
  action: string;
}>;
 type RedeemableRewardPayload = Record<{
  title: string;
  action: string;
  points: number;
 }>;

const entryStorage = new StableBTreeMap<string, Entry>(0, 44, 1024);
// CRUD Functions

// Create a new entry
$update;
export function createEntry(title: string, body: string, author: string, action : string, rewardPoints: number): Result<Entry, string> {
  if (!title || !body || !author || !action || isNaN(rewardPoints)) {
    return Result.Err('Invalid input. All fields must be provided, and rewardPoints must be a number.');
  }

  const entry: Entry = {
    id: uuidv4(),
    author: author,
    title: title,
    body: body,
    action: action,
    createdAt: ic.time(),
    updatedAt: Opt.None,
    rewardPoints: rewardPoints,
  };
  entryStorage.insert(entry.id, entry); {

    if (entry.action === "New") { 
      entry.rewardPoints = 100} 
      else  {
        entry.rewardPoints = 50
  }
  return Result.Ok(entry);
}
};

// Read an entry by ID
$query;
export function readEntry(id: string): Result<Entry, string> {
  return match(entryStorage.get(id),{
    Some: (entry) => Result.Ok<Entry, string>(entry),
    None: () => Result.Err<Entry, string>(`an entry with id=${id} not found`)
});
};

// Update an existing entry's content and timestamp
$update;
export function updateEntry(id: string, payload: EntryPayload): Result<Entry, string> {
  if (!id || !payload) {
    return Result.Err('Invalid input. Both id and payload must be provided.');
  }

  return match(entryStorage.get(id), {
  Some : (entry) => {
    const updatedEntry : Entry = {...entry, ...payload, updatedAt: Opt.Some(ic.time())};
    entryStorage.insert(entry.id, updatedEntry);
    return Result.Ok<Entry, string>(updatedEntry);
  },
  None : () => {
    return Result.Err<Entry, string> (`Could not update a message with id=${id}. Entry not found`)
  }
});
};

// Delete an entry by ID
$update;
export function deleteEntry(id: string): Result<Entry, string> {
  return match(entryStorage.remove(id), {
    Some: (deletedEntry) => Result.Ok<Entry, string> (deletedEntry),
    None: () => Result.Err<Entry, string> (`couldn't delete an entry with id=${id}. Entry not found.`)
  })
}

// Function to get entries with their reward points
$query;
export function getEntriesWithRewards( ): Result<Vec<Entry>, string> {
  return Result.Ok(entryStorage.values());
};
// else {
//   Result.Err<Entry, string>('No entries have redeemable rewards')
// };

$query;
// Function to get redeemable rewards based on rewardPoints
export function getRedeemableRewards(rewardPoints: string): Result<Vec<RedeemableReward>, string> {
  if (!rewardPoints || isNaN(Number(rewardPoints))) {
    return Result.Err('Invalid input. rewardPoints must be provided and be a number.');
  }
  const redeemableRewards: Vec<RedeemableReward> = /* Logic to retrieve redeemable rewards based on rewardPoints */;
  
  if (redeemableRewards.length > 0) {
    return Result.Ok(redeemableRewards);
  } else {
    return Result.Err(`No entries have redeemable rewards for rewardPoints: ${rewardPoints}`);
  }
}


type MessagePayload = Record<{
    title: string;
    body: string;
}>

globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
