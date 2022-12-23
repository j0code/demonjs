export enum EmbedColorName {
	DEFAULT = "DEFAULT", WHITE = "WHITE", AQUA = "AQUA", GREEN = "GREEN",
	BLUE = "BLUE", YELLOW = "YELLOW", PURPLE = "PURPLE",
	LUMINOUS_VIVID_PINK = "LUMINOUS_VIVID_PINK", FUCHSIA = "FUCHSIA",
	GOLD = "GOLD", ORANGE = "ORANGE", RED = "RED", GREY = "GREY",
	NAVY = "NAVY", DARK_AQUA = "DARK_AQUA", DARK_GREEN = "DARK_GREEN",
	DARK_BLUE = "DARK_BLUE", DARK_PURPLE = "DARK_PURPLE",
	DARK_PINK = "DARK_PINK", DARK_GOLD = "DARK_GOLD",
	DARK_ORANGE = "DARK_ORANGE", DARK_RED = "DARK_RED",
	DARK_GREY = "DARK_GREY", DARKER_GREY = "DARKER_GREY",
	LIGHT_GREY = "LIGHT_GREY", DARK_NAVY = "DARK_NAVY",
	BLURPLE = "BLURPLE", GREYPLE = "GREYPLE",
	DARK_BUT_NOT_BLACK = "DARK_BUT_NOT_BLACK",
	NOT_QUITE_BLACK = "NOT_QUITE_BLACK", RANDOM = "RANDOM"
}

export const EMBED_COLORS: Map<EmbedColorName, number> = new Map<EmbedColorName, number>(Object.entries({
	DEFAULT:     0,        // #000000
	WHITE:       16777215, // #ffffff
	AQUA:        1752220,  // #1abc9c
	GREEN:       5763720,  // #57f288
	BLUE:        3447003,  // #3498db
	YELLOW:      16705116, // #fee65c
	PURPLE:      10246582, // #9c59b6
	LUMINOUS_VIVID_PINK: 15277666, // #e91e62
	FUCHSIA:     15418782, // #eb459e
	GOLD:        15844367, // #f1c40f
	ORANGE:      15105570, // #e67e22
	RED:         15548997, // #ed4245
	GREY:        9807270,  // #95a5a6
	NAVY:        3426654,  // #34495e
	DARK_AQUA:   1146986,  // #11806a
	DARK_GREEN:  2067276,  // #1f8b4c
	DARK_BLUE:   2123412,  // #206694
	DARK_PURPLE: 7419530,  // #71368a
	DARK_PINK:   218,      // #0000da
	DARK_GOLD:   12745998, // #c27d0e
	DARK_ORANGE: 11027200, // #a84300
	DARK_RED:    10038818, // #992e22
	DARK_GREY:   9936031,  // #979c9f
	DARKER_GREY: 8359053,  // #7f8c8d
	LIGHT_GREY:  12370112, // #bcc0c0
	DARK_NAVY:   2899536,  // #2c3e50
	BLURPLE:     5793266,  // #5865f2
	GREYPLE:     10070709, // #99aab5
	DARK_BUT_NOT_BLACK:  2895667, // #2c2f33
	NOT_QUITE_BLACK:     2303786, // #23272a
}) as [])

export type EmbedOptions = {
	author?: {
		icon_url?: string,
		name?:  string,
		proxy_icon_url?: string
		url?: string
	},
	color?: number | [number, number, number] | EmbedColorName,
	description?: string,
	fields?: {
		inline?: boolean,
		name?: string,
		value?: string
	}[],
	footer?: {
		icon_url?: string,
		proxy_icon_url?: string,
		text?: string
	},
	image?: {
		height?: number,
		proxy_url?: string,
		url?: string,
		width?: number
	},
	provider?: {
		name?: string,
		url?: string
	},
	thumbnail?: {
		height?: number,
		proxy_url?: string,
		url?: string,
		width?: number
	}
	timestamp?: string,
	title?: string,
	url?: string,
	video?: {
		height?: number,
		proxy_url?: string,
		url?: string,
		width?: number
	}
}