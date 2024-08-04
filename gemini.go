package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
)

type ModelProvider interface {
	GenerateContent(ctx context.Context, parts ...genai.Part) (*genai.GenerateContentResponse, error)
	StartChat() *genai.ChatSession
}
type GeminiController struct {
	model   ModelProvider
	session *genai.ChatSession
}

type Messages struct {
	Messages []Message `json:"messages"`
}

type Message struct {
	Text string `json:"text"`
	Role string `json:"role"`
}

func (g *GeminiController) Load() {
	g.session = g.model.StartChat()
	g.session.History = g.readHistoryFromFile()
}

func (g *GeminiController) readHistoryFromFile() []*genai.Content {
	jsonFile, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer jsonFile.Close()
	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		log.Fatal(err)
	}
	var messages Messages
	json.Unmarshal(byteValue, &messages)
	history := make([]*genai.Content, len(messages.Messages))
	for index, msg := range messages.Messages {
		newContent := &genai.Content{
			Parts: []genai.Part{
				genai.Text(msg.Text),
			},
			Role: msg.Role,
		}
		history[index] = newContent
	}
	return history
}

func (g *GeminiController) saveHistoryToFile() {
	// TODO write out json history to save
}

func (g *GeminiController) FetchChatResponse(prompt string) (string, error) {
	resp, err := g.session.SendMessage(context.Background(), genai.Text(prompt))
	if err != nil {
		log.Fatal(err)
	}
	responseTxt := string(resp.Candidates[0].Content.Parts[0].(genai.Text))
	return responseTxt, nil
}
