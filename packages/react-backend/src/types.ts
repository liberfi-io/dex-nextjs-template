export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AuthenticationResult = {
  __typename?: 'AuthenticationResult';
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type CreateTransactionInput = {
  amount: Scalars['String']['input'];
  destinationAddress: Scalars['String']['input'];
  mintAddress: Scalars['String']['input'];
  sourceAddress: Scalars['String']['input'];
};

export type JwtTokenSet = {
  __typename?: 'JwtTokenSet';
  accessToken: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addTokenToCollection: UpdateTokenCollectionResult;
  authenticatePrivy: AuthenticationResult;
  createTransferTransaction: UnsignedTransactionDto;
  removeTokenFromCollection: UpdateTokenCollectionResult;
  sendTransaction: SignedTransactionDto;
};


export type MutationAddTokenToCollectionArgs = {
  input: UpdateTokenCollectionInput;
};


export type MutationAuthenticatePrivyArgs = {
  input: PrivyAuthenticateInput;
};


export type MutationCreateTransferTransactionArgs = {
  input: CreateTransactionInput;
};


export type MutationRemoveTokenFromCollectionArgs = {
  input: UpdateTokenCollectionInput;
};


export type MutationSendTransactionArgs = {
  input: SendTransactionInput;
};

export type PrivyAuthenticateInput = {
  accessToken: Scalars['String']['input'];
  identityToken: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  currentUser: User;
  dexToken: JwtTokenSet;
  tokensInCollection: TokensInCollection;
};


export type QueryTokensInCollectionArgs = {
  input: TokensInCollectionInput;
};

export type SendTransactionInput = {
  signedTx: Scalars['String']['input'];
};

export type SignedTransactionDto = {
  __typename?: 'SignedTransactionDto';
  txSignature: Scalars['String']['output'];
};

export type TokensInCollection = {
  __typename?: 'TokensInCollection';
  tokenAddresses: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type TokensInCollectionInput = {
  type: Scalars['String']['input'];
};

export type UnsignedTransactionDto = {
  __typename?: 'UnsignedTransactionDto';
  amount: Scalars['String']['output'];
  destinationAddress: Scalars['String']['output'];
  estimatedFee: Scalars['String']['output'];
  mintAddress: Scalars['String']['output'];
  serializedTx: Scalars['String']['output'];
  sourceAddress: Scalars['String']['output'];
};

export type UpdateTokenCollectionInput = {
  tokenAddress: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type UpdateTokenCollectionResult = {
  __typename?: 'UpdateTokenCollectionResult';
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  ethereumAddress?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  idp?: Maybe<Scalars['String']['output']>;
  languageCode?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  solanaAddress?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};
