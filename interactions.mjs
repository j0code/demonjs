import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"

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
