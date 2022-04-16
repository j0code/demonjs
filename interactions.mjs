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
	client.application.commands.fetch()
	.then(cmds => {
		for(let cmd of cmds) {
			switch(cmd.name) {
				case "words":
				cmd.permissions.set({
					fullPermissions: [{
						id: special_ids.owner,
						type: "USER",
						permission: true
					}]
				})
			}
		}
	})
}
