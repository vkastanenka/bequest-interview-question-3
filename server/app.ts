// Dependencies
import cors from "cors";
import express, { NextFunction } from "express";

// Utils
import {
  generateHash,
  handleValidationErrors,
  validateData,
  validateTimestamp,
} from "./utils";

// Types
import { Request, Response } from "express";
import { DatabaseMasterType } from "./types";

const PORT = 8080;
const app = express();
const database: DatabaseMasterType = {
  current: {
    data: "Hello World",
    integrity: "",
    timestamp: new Date().toISOString(),
  },
  history: [],
};

// Initialize db integrity field => Used to compare client data to detect tampering
database.current.integrity = generateHash(database.current.data);

app.use(cors());
app.use(express.json());

// Routes

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ data: database.current.data });
});

// Reusable middleware to ensure current db integrity before any updates.
app.use((req: Request, res: Response, next: NextFunction) => {
  const currentDbIntegrity = generateHash(database.current.data);
  if (currentDbIntegrity !== database.current.integrity) {
    return res.status(400).json({
      message: "Database integrity compromised, please try again later!",
    });
  }
  next();
});

app.post(
  "/",
  validateData,
  handleValidationErrors,
  (req: Request, res: Response) => {
    // Update db history
    database.history.push({
      data: database.current.data,
      integrity: database.current.integrity,
      timestamp: new Date().toISOString(),
    });

    // Update db current
    database.current.data = req.body.data;
    database.current.integrity = generateHash(req.body.data);

    res.status(200).json({ message: "Data updated successfully!" });
  }
);

/**
 * Server side implementation of:
 *
 * 1. How does the client ensure that their data has not been tampered with?
 *
 * Compares request body data integrity with current db integrity to detect tampering.
 * Otherwise, provides histories for a client to choose from for their data restoration.
 */

app.post(
  "/validate",
  validateData,
  handleValidationErrors,
  (req: Request, res: Response) => {
    // Hash request body to compare with current db integrity to see if mismatch.
    const reqBodyDataIntegrity = generateHash(req.body.data);

    if (reqBodyDataIntegrity === database.current.integrity) {
      res.status(200).json({ message: "No data tampering detected!" });
    } else {
      // Find the history list item with the current timestamp
      const databaseHistoryListItem = database.history.find(
        (listItem) => listItem.timestamp === database.current.timestamp
      );

      // If not in history, add current db to history
      if (!databaseHistoryListItem) {
        database.history.push(database.current);
      }

      // Provide histories to client to restore from
      res.status(400).json({
        data: database.history.map((historyItem) => historyItem.timestamp),
        message: "Data has been tampered with, please restore history!",
      });
    }
  }
);

/**
 * Server side implementation of:
 *
 * 2. If the data has been tampered with, how can the client recover the lost data?
 *
 * Uses provided timestamp to restore data from history.
 */

app.patch(
  "/restore/:timestamp",
  validateTimestamp,
  handleValidationErrors,
  (req: Request, res: Response) => {
    // Return error if no history found
    if (!database.history.length) {
      return res.status(404).json({
        message: "No history found to restore data!",
      });
    }

    // Find the history list item with the provided timestamp
    const databaseHistoryListItem = database.history.find(
      (listItem) => listItem.timestamp === req.params.timestamp
    );

    // If no history list item found, return error
    if (!databaseHistoryListItem) {
      return res.status(404).json({
        message: "No data found for the provided timestamp!",
      });
    }

    // Restore data from history list item
    database.current = databaseHistoryListItem;

    res.status(200).json({ message: "Data restored successfully!" });
  }
);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
