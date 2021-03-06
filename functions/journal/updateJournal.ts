import * as admin from "firebase-admin";
import { APIGatewayProxyEvent, APIGatewayProxyCallback } from "aws-lambda";
// import { JJournal } from "../../types";

export default async function retrieveJournals(
  event: APIGatewayProxyEvent,
  callback: APIGatewayProxyCallback
) {
  try {
    // If no authorisation header is provided reject
    if (!event.headers.authorization) {
      return callback(null, {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Unauthorised, no token was provided" })
      });
    }
    // Extract JWT from header
    const JWT = event.headers.authorization;
    // Verify JWT, if user deleted, or JWT is invalid, this will throw an error
    await admin.auth().verifyIdToken(JWT, true);

    // extract journal id from query string
    const queryParam = event?.queryStringParameters;

    if (!queryParam?.journalId) {
      return callback(null, {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "no journal id was provided" })
      });
    }

    if (!queryParam?.title) {
      return callback(null, {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "no journal title was provided" })
      });
    }

    await admin
      .firestore()
      .collection("journals")
      .doc(queryParam.journalId)
      .update({ name: queryParam.title });

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Updated journal ID title" + queryParam.journalId
      })
    });
  } catch (error) {
    console.error("There was problem updating", error);
    return callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error })
    });
  }
}
