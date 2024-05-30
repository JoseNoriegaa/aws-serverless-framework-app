// External dependencies
import type { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import MockDate from "mockdate";

// Internal dependencies
import { handler } from "../../../src/functions/authorizer";

describe("λ - Authorizer", () => {
  beforeEach(() => {
    MockDate.set("2024-01-01T12:36:00");
  });

  it("should grant access if the provided token is correct", async () => {
    const event = {
      authorizationToken: "Bearer SECRET_KEY-12-36",
      methodArn: "methodArn",
    } as APIGatewayTokenAuthorizerEvent;

    const response = await handler(event);

    expect(response).toStrictEqual({
      principalId: "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "methodArn",
          },
        ],
      },
    });
  });

  it("should return unauthorized if the provided token is not valid", async () => {
    const event = {
      authorizationToken: "Bearer random",
      methodArn: "methodArn",
    } as APIGatewayTokenAuthorizerEvent;

    const action = async () => {
      await handler(event);
    };

    expect(action).rejects.toThrow("Unauthorized");
  });
});
