#!/usr/bin/env node
// Example: Using DefaultAzureCredential in Scout Analytics
// This demonstrates the "one-and-done" auth experience

const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

async function exampleUsage() {
    console.log("🔐 Example: Scout Analytics Azure Credential Usage\n");

    // 1. Initialize DefaultAzureCredential
    // This will automatically use:
    // - Managed Identity when running in Azure
    // - Azure CLI credentials when running locally (after 'az login')
    const credential = new DefaultAzureCredential();
    console.log("✅ DefaultAzureCredential initialized");

    // 2. Get secrets from Key Vault
    const keyVaultName = process.env.KEY_VAULT_NAME || 'kv-projectscout-prod';
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    const secretClient = new SecretClient(keyVaultUrl, credential);

    try {
        // Get database connection string
        const dbConnectionSecret = await secretClient.getSecret("DbConnectionString");
        console.log("✅ Database connection string retrieved from Key Vault");
        console.log(`   Length: ${dbConnectionSecret.value?.length || 0} characters`);

        // Get Azure OpenAI configuration
        const openAIEndpoint = await secretClient.getSecret("AzureOpenAIEndpoint");
        console.log("✅ Azure OpenAI endpoint retrieved from Key Vault");
        console.log(`   Endpoint: ${openAIEndpoint.value}`);

    } catch (error) {
        console.log("⚠️  Could not access Key Vault secrets:", error.message);
        console.log("   This is expected if secrets don't exist yet or permissions aren't set up");
    }

    // 3. Get SQL Database access token
    try {
        const sqlToken = await credential.getToken("https://database.windows.net/");
        if (sqlToken) {
            console.log("✅ SQL Database access token acquired");
            console.log(`   Token expires: ${new Date(sqlToken.expiresOnTimestamp)}`);
            console.log(`   Token preview: ${sqlToken.token.substring(0, 20)}...`);
        }
    } catch (error) {
        console.log("⚠️  Could not acquire SQL token:", error.message);
    }

    // 4. Example: Using in Express.js API endpoint
    console.log("\n📝 Example API endpoint implementation:");
    console.log(`
// api/insights.js
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const credential = new DefaultAzureCredential();
const secretClient = new SecretClient('https://kv-projectscout-prod.vault.azure.net', credential);

app.get('/api/insights', async (req, res) => {
    try {
        // Get database connection string from Key Vault
        const dbSecret = await secretClient.getSecret("DbConnectionString");
        const connectionString = dbSecret.value;
        
        // Connect to database with Managed Identity
        const connection = new mssql.ConnectionPool(connectionString);
        await connection.connect();
        
        // Query data and return insights
        const result = await connection.request().query('SELECT * FROM insights');
        res.json(result.recordset);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
    `);

    // 5. Example: Environment detection
    console.log("\n🌍 Environment Detection:");
    console.log(`Running in Azure: ${!!(process.env.WEBSITE_SITE_NAME || process.env.AZURE_CLIENT_ID)}`);
    console.log(`Azure CLI available: ${!!(process.env.AZURE_CONFIG_DIR)}`);
    console.log(`Managed Identity: ${!!(process.env.IDENTITY_ENDPOINT)}`);

    // 6. Benefits summary
    console.log("\n🎉 Benefits of this approach:");
    console.log("✅ No secrets in code or environment variables");
    console.log("✅ Works seamlessly locally and in Azure");
    console.log("✅ One-time setup with 'az login' for local development");
    console.log("✅ Automatic credential rotation and management");
    console.log("✅ Secure, Azure-native authentication");

    console.log("\n💡 Next steps:");
    console.log("1. Run: ./scripts/setup-managed-identity.sh");
    console.log("2. Install packages: npm install @azure/identity @azure/keyvault-secrets");
    console.log("3. Update your API code to use this pattern");
    console.log("4. Deploy and enjoy seamless authentication! 🚀");
}

// Run the example
exampleUsage().catch(console.error);