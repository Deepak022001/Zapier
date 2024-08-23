# Zapier

Zapier is an online automation tool that allows users to connect different apps and services to automate repetitive tasks without needing to code or rely on developers to build the integration. These connections are called “Zaps.”

# Part 1: WebHooks

    1.	It enables communication between two different backends.
    2.	For example, Razorpay provides a URL to HDFC. When a payment is completed, HDFC hits the URL, allowing Razorpay to confirm the payment and grant access to the course.
    3.	Watch the Webhook tutorial for more details.

# Backend Architecture

1st Approach

    1.	Store the request information in the database.
    2.	Add an entry to a message queue.

Problem:

    •	Ensuring consistency between database writes and message queue operations in distributed systems can be challenging. If one operation succeeds but the other fails, it may lead to potential data inconsistencies.

2nd Approach

    1.	First, send the request to Kafka.
    2.	The database picks up the entry from Kafka.

Problem:

    •	What if the queue processor takes the request, starts processing it, and sends an email before the entry has been successfully made in the database?

3rd Approach: Sweeper Mechanism

    1.	Initial Operation:
    •	First, store the request information in the database.
    •	Add an entry to a message queue (e.g., Kafka).
    2.	Failure Handling:
    •	If the queue operation fails, mark the entry as “pending” or “incomplete” in the database.
    3.	Sweeper Process:
    •	A background “Sweeper” process periodically (e.g., every 15 minutes) scans the database for entries marked as “pending.”
    •	If it finds any such entries, it retries the operation to add them to the queue for processing.
    4.	Idempotency and Monitoring:
    •	Ensure that operations are idempotent so that retries do not cause duplicates.
    •	Set up monitoring to ensure that no tasks remain in the “pending” state for too long.

-- How 3rd approach will work
Transactional Outbox Pattern Solution

    1.	Create an Outbox Table:
    •	What: Add a new table in your database called Outbox.
    •	Why: This table will temporarily hold messages that need to be sent to a queue.
    2.	Atomic Transaction:
    •	What: When you perform an update in your main database table (like adding user details), do two things in one transaction:
    1.	Update your main database table.
    2.	Insert a corresponding message into the Outbox table.
    •	Why: If both operations are part of the same transaction, either both will succeed or neither will, ensuring consistency.
    3.	Message Dispatcher:
    •	What: Use a background process or service to periodically check the Outbox table for new messages.
    •	Why: This process reads messages from the Outbox and sends them to the message queue.
    4.	Mark as Processed:
    •	What: After sending the message, the dispatcher updates the Outbox table to mark the message as processed or deletes it.
    •	Why: This prevents the same message from being sent multiple times.
    5.	Idempotency:
    •	What: Ensure that sending the same message multiple times does not cause problems.
    •	Why: If there are any issues and the message is retried, you want to avoid duplicate actions.

in db there are 2 entries
trigger
trigger_outbox

prisma.tx.create([{
prisma.trigger.create(), prisma.trigger._outbox.create()
])
