require("dotenv").config();
const db = require("../models");
const {
  josephineSystemPrompt,
  newChatPrompt,
} = require("../utils/prompts/josephine.prompts");
const { spawn } = require("child_process");
const { s3URLToPDFBase64 } = require("../utils/s3.utils");

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

exports.sendPrompt = async (req, res, next) => {
  try {
    const prompt = req.body.prompt;

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

    const messages = conversationHistory.map((conversation) => {
      const content = [];
      if (conversation.attachments.length) {
        conversation.attachments.forEach(async (attachment) => {
          const pdfBase64 = await s3URLToPDFBase64(attachment.s3Key);
          content.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          });
        });
      }
      content.push({ type: "text", text: conversation.message });
      return {
        role: conversation.author === "ai" ? "assistant" : "user",
        content,
      };
    });

    const content = [];

    if (req.files) {
      for (let file of req.files) {
        const pdfBase64 = file.buffer.toString("base64");
        content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: pdfBase64,
          },
        });
      }
    }

    content.push({ type: "text", text: prompt });

    messages.push({ role: "user", content });

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

    await chat.saveConversation("user", prompt, req.files);
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

exports.voiceChat = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({
      message: "No audio file uploaded",
      type: "error",
    });
  }

  const transcription = await transcribeWithWhisper(req.file.path);

  console.log("Audio file received", req.file);

  res.status(200).send({
    message: "File successfully uploaded",
    type: "success",
    transcription,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
  });
};

const transcribeWithWhisper = (audioPath) => {
  return new Promise((resolve, reject) => {
    const whisper = spawn("whipser", [
      audioPath,
      "--model",
      "base",
      "--output_format",
      "txt",
      "--output_dir",
      "./uploads",
    ]);

    let output = "";
    whisper.stdout.on("data", (data) => {
      output += data.toString();
    });

    whisper.on("close", (code) => {
      if (code === 0) {
        // Read the generated text file
        const txtPath = audioPath.replace(path.extname(audioPath), ".txt");
        const transcription = fs.readFileSync(txtPath, "utf-8");
        fs.unlinkSync(txtPath); // Cleanup
        resolve(transcription.trim());
      } else {
        reject(new Error("Whisper transcription failed"));
      }
    });
  });
};
