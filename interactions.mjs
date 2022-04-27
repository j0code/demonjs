import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { client } from "./main.mjs"
import special_ids from "./util/special_ids.mjs"

const rest = new REST({version: 9})

export async function updateAppCommands(token, id, appCommands) {
  rest.setToken(token)
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationCommands(id),
      { body: appCommands },
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

export function setPermissions() {
	/*let perms = client.application.commands.permissions
	perms.set({

	})*/

	// this sht doesn't work because Discord only allows per-guild permissions
	/*client.application.commands.fetch()
	.then(cmds => {
		console.log(cmds)
		for(let cmd of cmds.values()) {
			console.log(cmd)
			switch(cmd.name) {
				case "words":
				case "dictionary":
				cmd.permissions.set({
					fullPermissions: [{
						id: special_ids.owner,
						type: "USER",
						permission: true
					}]
				})
				console.log(`Set /${cmd.name} permission for ${special_ids.owner}`)
			}
		}
	})*/
}
