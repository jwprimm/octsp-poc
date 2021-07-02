/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "Octank-Sports-POC"

const userIdPresent = true; // TODO: update in case is required to use that definition
const partitionKeyName = "";
const partitionKeyType = "";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/votes";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';
// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

 app.get(path, function(req, res) {
   var keyParams = {};
   var querParms = req.apiGateway.event.queryStringParameters;
   if (req.apiGateway) {
     keyParams = querParms
   };

   console.log(keyParams);

   let getItemParams = {
     TableName: tableName,
     Key: keyParams
   }

   console.log(getItemParams);

   dynamodb.get(getItemParams,(err, data) => {
     if(err) {
       console.log(err);
       res.statusCode = 500;
       res.json({error: 'Could not load items: ' + err.message});
     } else {
       if (data.Item) {
         res.json(data.Item);
         console.log(data.Item);
       } else {
         res.json(data);
         console.log(data);
       }
     }
   });
 });

/************************************
* HTTP put method for insert object *
*************************************/

app.put(path, function(req, res) {

  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }
  var reqKey = req.apiGateway.event.queryStringParameters.guid
  var voteType = req.apiGateway.event.queryStringParameters.vote
  var voterType = req.apiGateway.event.queryStringParameters.voter
  var user = req.apiGateway.event.queryStringParameters.user
  var email = `${user}`
  console.log(reqKey)
  console.log(voteType)
  console.log(voterType)
  console.log(user)

  let updateItemParams = {
    TableName: tableName,
    Key: {guid: reqKey},
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'SET #votes = #votes + :val, #voter = list_append(#voter, :user)',
    ExpressionAttributeNames: {
      "#votes": `${voteType}`,
      "#voter": `${voterType}`
    },
    ExpressionAttributeValues: {
      ':val': 1,
      ':user': [`${user}`]
    },
  };

  console.log(updateItemParams);

  dynamodb.update(updateItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
      console.log(err);
    } else{
      res.json({success: 'put call succeed!', url: req.url, data: data})
    }
  });
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
