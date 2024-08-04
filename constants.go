package main

import (
	"time"

	"github.com/fatih/color"
)

// Prompt Constants
const bannerTitle = `
*********************************************************************************

░░      ░░░  ░░░░  ░░       ░░░        ░░       ░░░        ░░░      ░░░  ░░░░  ░
▒  ▒▒▒▒  ▒▒▒  ▒▒  ▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒▒▒▒   ▒▒   ▒
▓  ▓▓▓▓▓▓▓▓▓▓    ▓▓▓▓       ▓▓▓      ▓▓▓▓       ▓▓▓▓▓▓  ▓▓▓▓▓▓      ▓▓▓        ▓
█  ████  █████  █████  ████  ██  ████████  ███  ██████  ███████████  ██  █  █  █
██      ██████  █████       ███        ██  ████  ██        ███      ███  ████  █
                                                                                
a GenAI-powered adventure by Chris 'Coy' Coykendall (chriscoyfish@gmail.com)
*********************************************************************************
Welcome, Senna Bladesmith...
`

const bannerEnding = `
*********************************************************************************
THANKS FOR PLAYING!!!
*********************************************************************************
`

// Banner colors
const bannerColor = color.FgCyan
const endingColor = color.FgGreen

// Prompts
const inputColor = color.FgHiWhite
const promptColor = color.FgCyan
const responseColor = color.FgGreen
const tPromptPrefix = "▶ "

// Errors
const tGameError = "<CYBERISM GAME ERROR: %s>"
const errAPIKey = "CYBERISM_API_KEY environment variable or --api_key flag must be set"

// Progress Spinner
var progressAnim = []string{"◢", "◣", "◤", "◥"}

const progressSpeed = 50 * time.Millisecond

// Commands
const cmdQuit = "quit"
const cmdGameOver = "GAME OVER"

// Configuration variables & files
const geminiModel = "gemini-1.5-pro-latest"
const filePath = "_cyberism.json"
