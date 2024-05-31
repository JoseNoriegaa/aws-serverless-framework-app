# AWS Serverless framework App

This is a AWS Serverless Framework Application that allows to save users in a database.

> Motivation: This is part of my journey of learning about AWS. I developed this application for the Advanced Serverless Framework course by Platzi.

## Architecture


## Features
- Implementation of Lambda functions for HTTP Events
- Implementation of Lambda functions for SQS Events
- Implementation of Lambda functions for S3 Events
- DynamoDB Integration
- Lambda Layers
- API Key authorization
- Custom Authorizer
- Unit test with JEST (100% Coverage)
- CI/CD with Github Actions
- TypeScript

## Deployment
If you want to deploy this application in your AWS environment, don't forget to change the S3 bucket name in the custom section of the `serverless.yml` file.

```bash
$ npx sls deploy
```

## Endpoints

### POST /users
This endpoint allows you to create a user record in DynamoBD.

#### Request example
```bash
curl --location 'http://your-domain.com/users' \
--header 'Authorization: Bearer <SECRET KEY FROM SSM>-<CURRENT UTC HOUR>-<CURRENT UTC MINUTE>' \
--header 'Content-Type: application/json' \
--data '{
	"firstName": "john",
    "lastName": "doe"
}'
```

#### Response example
```json
{
    "pk": "f2189613-34c5-48a6-bc0e-c44bc968df33",
    "firstName": "john",
    "lastName": "doe",
    "likes": "0",
    "createdAt": "2024-05-31T05:59:09.467Z",
    "updatedAt": "2024-05-31T05:59:09.467Z"
}
```

### GET /users
This endpoint returns the list of users. A query parameter named `lastKey` containing the last id of the users from a previous request can be used for pagination.

#### Request example
```bash
curl --location 'http://your-domain.com/users/' \
--header 'x-api-key: <Your APT Key>'
```

#### Response example
```json
{
    "lastKey": null,
    "pageSize": 10,
    "count": 1,
    "items": [
        {
            "createdAt": "2024-05-31T05:59:09.467Z",
            "likes": "0",
            "pk": "f2189613-34c5-48a6-bc0e-c44bc968df33",
            "firstName": "john",
            "lastName": "doe",
            "updatedAt": "2024-05-31T05:59:09.467Z"
        },
    ]
}
```

### GET /users/{id}
This endpoint allows you to get the information of a single user.

#### Request example
```bash
curl --location 'http://your-domain.com/users/f2189613-34c5-48a6-bc0e-c44bc968df33' \
--header 'x-api-key: <Your API Key>'
```
#### Response example
```json
{
    "createdAt": "2024-05-31T05:59:09.467Z",
    "likes": "0",
    "pk": "f2189613-34c5-48a6-bc0e-c44bc968df33",
    "lastName": "doe",
    "updatedAt": "2024-05-31T05:59:09.467Z",
    "firstName": "john"
}
```

### PUT /users/{id}
This endpoint allows you to update the first name and last name of a user.

#### Request example
```bash
curl --location --request PUT 'http://your-domain.com/users/2b808b73-a671-48af-9a55-85e5baed36af' \
--header 'Authorization: Bearer <SECRET KEY FROM SSM>-<CURRENT UTC HOUR>-<CURRENT UTC MINUTE>' \
--header 'Content-Type: application/json' \
--data '{
	"firstName": "Juan",
    "lastName": "gomez"
}'
```

#### Response example

```json
{
    "createdAt": "2024-05-27T22:49:36.222Z",
    "pk": "2b808b73-a671-48af-9a55-85e5baed36af",
    "firstName": "Juan",
    "lastName": "gomez",
    "updatedAt": "2024-05-31T06:09:26.857Z"
}
```

### DELETE /users/{id}
This endpoint allows you to delete a user record from the database.

#### Request example
```bash
curl --location --request DELETE 'http://your-domain.com/users/f2189613-34c5-48a6-bc0e-c44bc968df33' \
--header 'Authorization: Bearer <SECRET KEY FROM SSM>-<CURRENT UTC HOUR>-<CURRENT UTC MINUTE>'
```

#### Response example

```json
{
    "createdAt": "2024-05-31T05:59:09.467Z",
    "likes": "0",
    "pk": "f2189613-34c5-48a6-bc0e-c44bc968df33",
    "lastName": "doe",
    "updatedAt": "2024-05-31T05:59:09.467Z",
    "firstName": "john"
}
```

### POST /signed-url
This endpoint allows you to generate a signed s3 url to upload an image.

#### Request example
```bash
curl --location 'http://your-domain.com/signed-url' \
--header 'Authorization: Bearer <SECRET KEY FROM SSM>-<CURRENT UTC HOUR>-<CURRENT UTC MINUTE>' \
--header 'Content-Type: application/json' \
--data '{
    "filename": "image.jpeg"
}'
```

#### Response example
The url in the response will be used to upload an image in your s3 bucket.

```json
{
    "url": "http://your-domain.com/upload/image.jpeg?..."
}
```

### POST /like-user
This endpoint allows increment the likes counter attribute from a user record.

#### Request example
```bash
curl --location 'http://your-domain.com/like-user' \
--header 'Content-Type: application/json' \
--data '{
    "id": "2b808b73-a671-48af-9a55-85e5baed36af"
}'
```

#### Response example

```json
{
    "message": "accepted"
}
```
