package main

import "flag"

var apiKey = flag.String("api_key", "", "Google Cloud API Key. See https://aistudio.google.com/app/apikey for quickstart.")

func main() {
	flag.Parse()
	c := CyberismController{}
	c.StartGame()
}
