package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/domdavis/gospin"
	"github.com/fatih/color"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type CyberismController struct {
	txt     *color.Color
	gemini  *GeminiController
	mutex   *sync.RWMutex
	waiting bool
}

func (c *CyberismController) StartGame() {
	c.mutex = &sync.RWMutex{}
	c.runIntroRoutine()
	client := c.initializeGemini()
	defer client.Close()
	c.runGameLoop()
	c.persistSaveData()
	c.endGame()
}

func (c *CyberismController) persistSaveData() {
	c.gemini.saveHistoryToFile()
}

func (c *CyberismController) initializeGemini() *genai.Client {
	key := c.getGeminiAPIKey()
	client, err := genai.NewClient(context.Background(), option.WithAPIKey(key))
	if err != nil {
		log.Fatal(err)
	}
	mdl := client.GenerativeModel(geminiModel)
	mdl.SafetySettings = []*genai.SafetySetting{
		{
			Category:  genai.HarmCategoryDangerousContent,
			Threshold: genai.HarmBlockNone,
		},
		{
			Category:  genai.HarmCategoryHarassment,
			Threshold: genai.HarmBlockNone,
		},
		{
			Category:  genai.HarmCategoryHateSpeech,
			Threshold: genai.HarmBlockNone,
		},
		{
			Category:  genai.HarmCategorySexuallyExplicit,
			Threshold: genai.HarmBlockNone,
		},
	}
	c.gemini = &GeminiController{
		model: mdl,
	}
	c.gemini.Load()
	return client
}

func (c *CyberismController) getGeminiAPIKey() string {
	if *apiKey != "" {
		return *apiKey
	}
	if os.Getenv("CYBERISM_API_KEY") != "" {
		return os.Getenv("CYBERISM_API_KEY")
	}
	c.txt.Println(errAPIKey)
	log.Fatal(errors.New(errAPIKey))
	return ""
}

func (c *CyberismController) runIntroRoutine() {
	c.txt = color.New(bannerColor)
	c.txt.Printf(bannerTitle)
}

func (c *CyberismController) runWaitingSpinner() {
	s := gospin.New(progressAnim...)
	defer s.Done()
	color.Set(responseColor)
	defer color.Unset()
	for c.waiting {
		time.Sleep(progressSpeed)
		s.Advance()
	}
}

func (c *CyberismController) awaitGeminiResponse(text string) (string, error) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.waiting = true
	go c.runWaitingSpinner()
	resp, err := c.gemini.FetchChatResponse(text)
	c.waiting = false
	time.Sleep(progressSpeed)
	return resp, err
}

func (c *CyberismController) runGameLoop() {
	iText := ""
	for iText != cmdQuit {
		c.txt = color.New(responseColor)
		resp, err := c.awaitGeminiResponse(iText)
		if err != nil {
			c.txt.Printf(tGameError, err)
		}
		if strings.Contains(resp, cmdGameOver) {
			break
		}
		c.txt.Printf(tPromptPrefix+"%s", resp)
		c.txt = color.New(promptColor)
		c.txt.Print(tPromptPrefix)
		color.Set(inputColor)
		defer color.Unset()
		fmt.Scanln(&iText)
	}
}

func (c *CyberismController) endGame() {
	c.txt = color.New(endingColor)
	defer color.Unset()
	c.txt.Printf(bannerEnding)
}
