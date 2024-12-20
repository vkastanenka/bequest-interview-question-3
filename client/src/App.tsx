// Dependencies
import React, { useEffect, useState } from "react";
import { format as formatDate, parseISO } from "date-fns";

const API_URL = "http://localhost:8080";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

function App() {
  const [data, setData] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbHistories, setDbHistories] = useState<string[]>([]);
  const [dbRestoreDate, setDbRestoreDate] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  // Display message for 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (message) {
      timer = setTimeout(() => setMessage(""), 5000);
    }
    return () => clearTimeout(timer);
  }, [message]);

  const getData = async () => {
    await setIsLoading(true);

    const response = await fetch(API_URL);

    const { data } = await response.json();

    await setData(data);
    setIsLoading(false);
  };

  const updateData = async () => {
    await setIsLoading(true);

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: JSON_HEADERS,
    });

    const { message } = await response.json();

    await getData();
    alert(message);
    setIsLoading(false);
  };

  /**
   * Client side implementation of:
   *
   * 1. How does the client ensure that their data has not been tampered with?
   *
   * Sends data to server for validation. If data has been tampered with, server will return an error message.
   */

  const verifyData = async () => {
    await setIsLoading(true);

    const response = await fetch(`${API_URL}/validate`, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: JSON_HEADERS,
    });

    const { data: resData, message } = await response.json();

    if (!response.ok) {
      setDbHistories(resData);
      setDbRestoreDate(resData[0]);
    }

    alert(message);
    setIsLoading(false);
  };

  /**
   * Client side implementation of:
   *
   * 2. If the data has been tampered with, how can the client recover the lost data?
   *
   * Sends timestamp to server to restore data from history.
   */

  const restoreData = async () => {
    await setIsLoading(true);

    const response = await fetch(`${API_URL}/restore/${dbRestoreDate}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
    });

    const { message } = await response.json();

    if (response.ok) {
      await getData();
      await setDbHistories([]);
      await setDbRestoreDate("");
    }

    alert(message);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>{dbHistories.length ? "Choose Restore Date" : "Saved Data"}</div>

      {dbHistories.length ? (
        <select
          disabled={isLoading}
          style={{ fontSize: "20px" }}
          onChange={(e) => setDbRestoreDate(e.target.value)}
        >
          {dbHistories.map((listItem, i) => (
            <option value={listItem} key={i}>
              {formatDate(parseISO(listItem), "PPpp")}
            </option>
          ))}
        </select>
      ) : (
        <input
          disabled={isLoading}
          style={{ fontSize: "30px" }}
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      )}

      {dbHistories.length ? (
        <button
          disabled={isLoading}
          style={{ fontSize: "20px" }}
          onClick={restoreData}
        >
          Restore Data
        </button>
      ) : (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={isLoading}
            style={{ fontSize: "20px" }}
            onClick={updateData}
          >
            Update Data
          </button>
          <button
            disabled={isLoading}
            style={{ fontSize: "20px" }}
            onClick={verifyData}
          >
            Validate Data
          </button>
        </div>
      )}

      {message && <div>{message}</div>}
    </div>
  );
}

export default App;
