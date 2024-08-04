# Cyberism: A GenAI-Powered Text Adventure

**Author:** Chris (Coy) Coykendall (chriscoyfish@gmail.com)

## Overview

Cyberism is a text-based adventure game set in a Cyberpunk-style dystopian future where technology has become all-encompassing. You are Senna Bladesmith, a hard-boiled detective who must navigate a world of corporate espionage, government surveillance, and artificial intelligence.

![](screenshot.png?raw=true)


## Features

Cyberism leverages the powerful Gemini AI APIs to build a world set using the general mechanics of Cyberpunk Red and an automated system for driving forward narration.

* **Choice-driven narrative:** Your decisions shape the story and determine your fate.
* **Intriguing characters:** Meet a cast of colorful characters, both allies and enemies.
* **Cyberpunk atmosphere:** Immerse yourself in a world of neon lights, gritty streets, and advanced technology.
* **Puzzles and challenges:** Test your hacking skills and problem-solving abilities.
* **Text-based interface:** The game is played through text prompts and commands.
* **Turn-based system:** You make choices and actions in turn-based fashion.
* **Inventory management:** Collect items and use them to your advantage.

## Installation

1. Download: `git clone https://github.com/chriscoyfish/cyberism.git`
2. Go into the downloaded directory: `cd cyberism`
3. Generate a Google Cloud API key w/ Gemini API permissions and pass this as --api_key or set the CYBERISM_API_KEY environment variable in your host.
    * See https://aistudio.google.com/app/apikey for the simple way to get this.
3. Run `go run .`

## Controls
Make numeric prepared selections with the numbers provided to advance the narrative. You may attempt character speech in quotes "like this". You may ask the game out-of-character instructions and questions in angle brackets <like this>. You may perform explicit actions {like this}.

**NOTE:** This is a work in progress using Gemini API (which is not perfect), and more features are being added regularly. Stay tuned for updates!

**Enjoy the game!**

## Updates

**2024-08-04** Initial commit. Notably still need to implement saving game state.
