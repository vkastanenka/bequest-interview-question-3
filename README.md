# 1. How does the client ensure that their data has not been tampered with?

- The client is provided a button to help check if their client side data has been tampered with.
- Sends the current input to the server, where it is hashed, and checked against current database integrity.
- If matching, then the client is notified that there has been no tampering.
- If discrepancy, then the current database is archived and the client is notified and provided with a form for step 2.

# 2. If the data has been tampered with, how can the client recover the lost data?

- If a discrepancy is found in step 1, then a list of timestamps is provided for the user to choose from for their data backup.
- A request is sent to the server, and data is restored to the previous point, recovering any data that might have been lost.
