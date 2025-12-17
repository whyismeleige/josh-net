require("dotenv").config();
const db = require("../models");
const {
  josephineSystemPrompt,
  newChatPrompt,
} = require("../utils/prompts/josephine.prompts");

const User = db.user;
const Chat = db.chat;

const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

exports.listChats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("chats");

    return res.status(200).send({
      message: "Chats retrieved successfully",
      type: "success",
      chats: user.chats,
    });
  } catch (error) {
    console.error("Error in Getting Chats for User", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.sendPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({
        message: "Prompt required",
        type: "error",
      });
    }

    let chat = null;
    const isNewConversation = !req.body.chatId;

    if (!isNewConversation) {
      chat = await Chat.findById(req.body.chatId);

      if (!chat) {
        return res.status(400).send({
          message: "Chat does not exist",
          type: "error",
        });
      }
    }

    const conversationHistory = chat ? chat.conversationHistory : [];

    const messages = conversationHistory.map((conversation) => ({
      role: conversation.author === "ai" ? "assistant" : "user",
      content: conversation.message,
    }));

    messages.push({ role: "user", content: prompt });

    const systemPrompt = `${josephineSystemPrompt}${
      isNewConversation ? newChatPrompt : ""
    }`;

    const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": `${ANTHROPIC_API_KEY}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 8000,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      return res.status(400).send({
        message: "Server Error, Try Again Later",
        type: "error",
      });
    }

    const data = await response.json();

    let conversationTitle = null;

    if (isNewConversation && data.content && data.content[0]) {
      const regex =
        /<conversation_title>\s*({[\s\S]*?})\s*<\/conversation_title>/;
      const responseText = data.content[0].text;
      const titleMatch = responseText.match(regex);

      if (titleMatch) {
        try {
          const titleData = JSON.parse(titleMatch[1]);
          conversationTitle = titleData.title;

          data.content[0].text = responseText
            .replace(/<conversation_title>[\s\S]*?<\/conversation_title>/, "")
            .trim();
        } catch (e) {
          console.error("Error parsing conversation title:", e);
        }
      }
    }

    if (isNewConversation) {
      chat = await Chat.create({
        title: conversationTitle,
        userId: req.user._id,
        aiModel: data.model,
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { chats: chat._id },
      });
    }

    await chat.saveConversation("user", prompt);
    chat = await chat.saveConversation("assistant", data.content[0].text);
  
    res.status(200).send({
      message: "Successfully Received Prompt",
      type: "success",
      chat,
      conversationTitle,
      isNewConversation,
    });
  } catch (error) {
    console.error("Error in Prompt", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.getChat = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({
        message: "Chat ID required",
        type: "error",
      });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(400).send({
        message: "Chat does not exist",
        type: "error",
      });
    }

    if (!chat.checkAccess(req.user._id)) {
      return res.status(403).send({
        message: "Unauthorized Access",
        type: "error",
      });
    }

    res.status(200).send({
      message: "Chat retrieved successfully",
      type: "success",
      chat,
    });
  } catch (error) {
    console.error("Error in Fetching Chat Data", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};
