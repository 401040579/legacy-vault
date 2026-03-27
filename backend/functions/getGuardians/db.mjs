/**
 * DynamoDB helper utilities.
 * Uses AWS SDK v3 with document client for cleaner API.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * Put an item into a table.
 */
async function putItem(tableName, item) {
  await docClient.send(new PutCommand({
    TableName: tableName,
    Item: item,
  }));
  return item;
}

/**
 * Put an item, but fail if the primary key already exists.
 */
async function putItemIfNotExists(tableName, item, pkName) {
  try {
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: `attribute_not_exists(${pkName})`,
    }));
    return { success: true, item };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { success: false, item: null };
    }
    throw err;
  }
}

/**
 * Get a single item by key.
 */
async function getItem(tableName, key) {
  const result = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: key,
  }));
  return result.Item || null;
}

/**
 * Query items by partition key.
 */
async function queryItems(tableName, pkName, pkValue) {
  const result = await docClient.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: `${pkName} = :pk`,
    ExpressionAttributeValues: { ':pk': pkValue },
  }));
  return result.Items || [];
}

/**
 * Query a GSI.
 */
async function queryIndex(tableName, indexName, pkName, pkValue) {
  const result = await docClient.send(new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: `${pkName} = :pk`,
    ExpressionAttributeValues: { ':pk': pkValue },
  }));
  return result.Items || [];
}

/**
 * Delete an item by key.
 */
async function deleteItem(tableName, key) {
  await docClient.send(new DeleteCommand({
    TableName: tableName,
    Key: key,
  }));
}

/**
 * Update specific fields on an item.
 */
async function updateItem(tableName, key, updates) {
  const entries = Object.entries(updates);
  if (entries.length === 0) return;

  const expression = 'SET ' + entries.map(([k], i) => `#f${i} = :v${i}`).join(', ');
  const names = {};
  const values = {};
  entries.forEach(([k, v], i) => {
    names[`#f${i}`] = k;
    values[`:v${i}`] = v;
  });

  await docClient.send(new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: expression,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }));
}

export {
  putItem,
  putItemIfNotExists,
  getItem,
  queryItems,
  queryIndex,
  deleteItem,
  updateItem,
};
