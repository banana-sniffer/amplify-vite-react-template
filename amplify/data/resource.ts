import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  WorkoutCompletion: a
    .model({
      weekNum: a.integer(),
      day: a.string(),
      isCompleted: a.boolean(),
      owner: a.string(),  // This will store the user ID
    })
    .authorization(allow => [allow.owner()]),

  Cheer: a
    .model({
      weekNum: a.integer(),
      day: a.string(),
      message: a.string(),
      timestamp: a.string(),
      owner: a.string(),  // This will store the user ID who created the cheer
    })
    .authorization(allow => [
      // Allow owner full access
      allow.owner(),
      // Allow all authenticated users to read cheers
      allow.authenticated().to(['read']),
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
