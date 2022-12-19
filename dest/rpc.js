export {};
/*import RPC from 'discord-rpc'

const clientId = "921884845523738675"
const clientSecret = "409e9acdc3e53efb545f619a726ab94c6e9aa72d9eb1f9716cdaebe9378b15cd"
const scopes = ["rpc", "rpc-api", "messages.read"]

const client = new RPC.Client({ transport: "ipc" })

client.on("ready", () => {
    console.log('[RPC] Logged in as', client.application.name)
  console.log('[RPC] Authed for user', client.user.username)
})

client.login({ clientId, clientSecret, scopes })
.then(() => console.log("[RPC] login ok"))
.catch(e => console.log("[RPC] login error:", e))

client.on("startrpc", console.log)
*/ 
