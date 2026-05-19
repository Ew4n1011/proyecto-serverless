const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

exports.getUsers = async () => {
  try {
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      }),
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.Items || []),
    };
  } catch (error) {
    console.error("Error getting users:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Error getting users from DynamoDB",
        error: error.message,
        name: error.name,
      }),
    };
  }
};
