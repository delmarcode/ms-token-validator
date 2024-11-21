require('dotenv').config();

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Validate required environment variables
if (!process.env.TENANT_ID) {
  throw new Error('TENANT_ID environment variable is not set. Please check your .env file.');
}

if (!process.env.APPLICATION_ID) {
  throw new Error('APPLICATION_ID environment variable is not set. Please check your .env file.');
}

// Log environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('Using TENANT_ID:', process.env.TENANT_ID);
  console.log('Using APPLICATION_ID:', process.env.APPLICATION_ID);
}


// Initialize the JWKS client
const client = jwksClient({
  // Use OpenID Connect metadata endpoint for v2.0
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
});

// Function to get the signing key
const getSigningKey = async (kid) => {
  try {
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
  } catch (error) {
    throw new Error(`Error getting signing key: ${error.message}`);
  }
};

// Validate the token
const validateAccessToken = async (token) => {
  try {
    // Decode the token header to get the kid (key ID)
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      throw new Error('Invalid token format');
    }

    console.log('\nDecoded token header:', JSON.stringify(decodedToken.header, null, 2));
    console.log('\nDecoded token payload:', JSON.stringify(decodedToken.payload, null, 2));

    const { kid } = decodedToken.header;
    const publicKey = await getSigningKey(kid);

    // Extract issuer from token to handle both v1.0 and v2.0 tokens
    const tokenIssuer = decodedToken.payload.iss;

    // Verify the token
    const verified = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: process.env.APPLICATION_ID,
      issuer: tokenIssuer // Use the issuer from the token
    });

    return {
      isValid: true,
      payload: verified
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Main function to test the token
const testToken = async () => {
  // Get the token from command line arguments
  const token = process.argv[2];

  if (!token) {
    console.error('Please provide a token as a command line argument');
    console.error('Usage: node index.js <your-access-token>');
    process.exit(1);
  }

  console.log('Testing token validation...');
  const result = await validateAccessToken(token);

  if (result.isValid) {
    console.log('\n✅ Token is valid!');
    console.log('\nValidated payload:', JSON.stringify(result.payload, null, 2));
  } else {
    console.log('\n❌ Token is invalid!');
    console.log('Error:', result.error);
  }
};

// Run the test
testToken().catch(console.error);
