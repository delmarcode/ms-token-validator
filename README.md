# Microsoft Access Token Validator

A simple Node.js utility to validate Microsoft access tokens using JWKS (JSON Web Key Set).

## Setup

1. Clone this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (`cp .env.example .env`):
   ```
   TENANT_ID=your-tenant-id-here
   APPLICATION_ID=api://your-application-id-here
   ```
   Replace the values with:
   - `TENANT_ID`: Your Azure AD tenant ID
   - `APPLICATION_ID`: Your application's client ID/audience (with the `api://` prefix)

## Usage

Run the validator with your access token:
   ```bash
   node index.js <your-access-token>
   ```

## How It Works

This script performs the following steps to validate Microsoft access tokens:

1. Loads environment variables for your tenant ID and application ID
2. Fetches the JWKS (JSON Web Key Set) from Microsoft's OpenID Connect metadata endpoint
3. Decodes the provided access token to extract the key ID (kid) and token payload
4. Retrieves the corresponding public key from the JWKS endpoint
5. Validates the token's:
   - Signature using the public key
   - Audience claim matches your APPLICATION_ID
   - Issuer claim matches Microsoft's token issuer
   - Token format and algorithms

The script outputs:
- The decoded token header and payload for inspection
- Validation result (✅ valid or ❌ invalid)
- Full validated payload or error message if validation fails

This validation ensures the token:
- Was issued by Microsoft
- Hasn't been tampered with
- Is intended for your application
- Contains valid claims and signatures
