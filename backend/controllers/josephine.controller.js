/**
 * Josephine Controller
 *
 * This controller manages the AI chat functionality for the Josephine chatbot.
 * It handles conversation management, message history, file attachments,
 * and integration with the Anthropic Claude API.
 */

require("dotenv").config();
const db = require("../models");
const { ValidationError } = require("../utils/error.utils");
const {
  josephineSystemPrompt,
  newChatPrompt,
} = require("../utils/prompts/josephine.prompts");
const { s3URLToPDFBase64 } = require("../utils/s3.utils");

// Database models
const User = db.user;
const Chat = db.chat;

// Anthropic API configuration
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * List all chats for the authenticated user
 *
 * @route GET /api/v1/josephine/chats
 * @access Private (Student role required)
 * @returns {Object} Response containing array of user's chats
 */
exports.listChats = asyncHandler(async (req, res) => {
  // Find user and populate their chats
  const user = await User.findById(req.user._id).populate({
    path: "chats",
    // match: { isDeleted: false }, // Uncomment to filter deleted chats
  });

  // Filter out null chat references (in case of deleted chats)
  if (user) {
    user.chats = user.chats.filter((chat) => chat !== null);
  }

  return res.status(200).send({
    message: "Chats retrieved successfully",
    type: "success",
    chats: user.chats,
  });
});

/**
 * Send a prompt to the AI and receive a response
 *
 * This function handles:
 * - New conversation creation
 * - Existing conversation continuation
 * - File attachments (PDFs)
 * - Conversation history management
 * - Integration with Anthropic Claude API
 *
 * @route POST /api/v1/josephine/prompt
 * @access Private (Student role required)
 * @body {String} prompt - The user's message
 * @body {String} [chatId] - Optional chat ID for continuing conversation
 * @files {Array} [files] - Optional PDF attachments
 * @returns {Object} Response containing chat data and AI response
 */
exports.sendPrompt = asyncHandler(async (req, res) => {
  const prompt = req.body.prompt;

  // Validate that prompt exists
  if (!prompt) {
    throw new ValidationError("Prompt is required");
  }

  let chat = null;
  const isNewConversation = !req.body.chatId;

  // If continuing existing conversation, fetch the chat
  if (!isNewConversation) {
    chat = await Chat.findById(req.body.chatId);

    if (!chat) {
      throw new ValidationError("Chat does not exist");
    }
  }

  // Get conversation history or start with empty array
  const conversationHistory = chat ? chat.conversationHistory : [];

  // Build message array from conversation history
  // Each message includes text and any PDF attachments
  const messages = conversationHistory.map((conversation) => {
    const content = [];

    // Add PDF attachments as document content blocks
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

    // Add text message
    content.push({ type: "text", text: conversation.message });

    return {
      role: conversation.author === "ai" ? "assistant" : "user",
      content,
    };
  });

  // Prepare current message content
  const content = [];

  // Process uploaded files (if any)
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

  // Add user's text prompt
  content.push({ type: "text", text: prompt });

  // Add current message to messages array
  messages.push({ role: "user", content });

  // Build system prompt - add special instructions for new conversations
  const systemPrompt = `${josephineSystemPrompt}${
    isNewConversation ? newChatPrompt : ""
  }`;

  /**
   * @todo Convert Claude API call to use official Anthropic SDK
   * @todo Implement RAG based pipeline for better context handling
   */
  // Call Anthropic Claude API
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

  // Handle API errors
  if (!response.ok) {
    throw new ValidationError("Server Error, Try Again Later");
  }

  const data = await response.json();

  let conversationTitle = null;

  // Extract conversation title from AI response (for new conversations)
  // The AI is prompted to return a title in XML tags for new conversations
  if (isNewConversation && data.content && data.content[0]) {
    const regex =
      /<conversation_title>\s*({[\s\S]*?})\s*<\/conversation_title>/;
    const responseText = data.content[0].text;
    const titleMatch = responseText.match(regex);

    if (titleMatch) {
      try {
        // Parse JSON title data
        const titleData = JSON.parse(titleMatch[1]);
        conversationTitle = titleData.title;

        // Remove title XML tags from response text
        data.content[0].text = responseText
          .replace(/<conversation_title>[\s\S]*?<\/conversation_title>/, "")
          .trim();
      } catch (e) {
        console.error("Error parsing conversation title:", e);
      }
    }
  }

  // Create new chat document if this is a new conversation
  if (isNewConversation) {
    chat = await Chat.create({
      title: conversationTitle,
      userId: req.user._id,
      aiModel: data.model,
    });

    // Add chat reference to user's chats array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { chats: chat._id },
    });
  }

  // Save user message and AI response to conversation history
  await chat.saveConversation("user", prompt, req.files);
  chat = await chat.saveConversation("assistant", data.content[0].text);

  res.status(200).send({
    message: "Successfully Received Prompt",
    type: "success",
    chat,
    conversationTitle,
    isNewConversation,
  });
});

/**
 * Get a specific chat by ID
 *
 * Includes authorization check to ensure user has access to the chat
 *
 * @route GET /api/v1/josephine/chat/:id
 * @access Private (Student role required)
 * @param {String} id - Chat ID
 * @returns {Object} Response containing chat data
 */
exports.getChat = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Validate chat ID parameter
  if (!id) {
    throw new ValidationError("Chat ID is required");
  }

  // Find chat by ID
  const chat = await Chat.findById(id);

  if (!chat) {
    throw new NotFoundError("Chat does not exist");
  }

  // Check if user has access to this chat
  if (!chat.checkAccess(req.user._id)) {
    throw new AuthorizationError("Unauthorized Access");
  }

  // Don't return deleted chats
  if (chat.isDeleted) {
    throw new NotFoundError("Chat not found");
  }

  res.status(200).send({
    message: "Chat retrieved successfully",
    type: "success",
    chat,
  });
});

/**
 * Soft delete a chat
 *
 * Marks the chat as deleted without removing it from the database
 *
 * @route DELETE /api/v1/josephine/chat/:id
 * @access Private (Student role required)
 * @param {String} id - Chat ID
 * @returns {Object} Success message
 */
exports.deleteChat = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Validate chat ID parameter
  if (!id) {
    throw new ValidationError("Chat ID is required");
  }

  // Find chat by ID
  const chat = await Chat.findById(id);

  if (!chat) {
    throw new NotFoundError("Chat does not exist");
  }

  // Perform soft delete (sets isDeleted flag)
  await chat.softDelete();

  res.status(200).send({
    message: "Chat deleted successfully",
    type: "success",
  });
});

exports.batchDelete = async (req, res) => {
  try {
    const { chatIds } = req.body;

    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).send({
        message: "Please select the required chats",
        type: "error",
      });
    }

    const chats = await Chat.find({
      _id: { $in: chatIds },
      isDeleted: false, // Optional: only find chats that aren't already deleted
    });

    if (chats.length === 0) {
      return res.status(404).send({
        message: "No chats found",
        type: "error",
      });
    }

    await Promise.all(chats.map((chat) => chat.softDelete()));

    res.status(200).send({
      message: "Chats deleted successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Deleting Multiple Chats", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

/**
 * Modify chat details
 *
 * Allows updating:
 * - Star status (toggle)
 * - Chat title/name
 * - Access level (public/private)
 *
 * @route PATCH /api/v1/josephine/chat/:id
 * @access Private (Student role required)
 * @param {String} id - Chat ID
 * @body {Object} details - Object containing modification flags
 * @body {Boolean} [details.changeStar] - Toggle star status
 * @body {String} [details.newName] - New chat title
 * @body {Boolean} [details.changeAccess] - Toggle access level
 * @returns {Object} Success message
 */
exports.modifyChat = asyncHandler(async (req, res) => {
  const { details } = req.body;
  const id = req.params.id;

  // Validate chat ID parameter
  if (!id) {
    throw new ValidationError("Chat ID is required");
  }

  // Find chat by ID
  const chat = await Chat.findById(id);

  if (!chat) {
    throw new NotFoundError("Chat does not exist");
  }

  // Validate details object
  if (typeof details !== "object") {
    throw new ValidationError("Validation Error");

  }

  // Update chat details based on provided flags
  await chat.changeDetails(details);

  res.status(200).send({
    message: "Chat Successfully Modified",
    type: "success",
  });
});

// ============================================================================
// VOICE CHAT FEATURE (COMMENTED OUT - NOT YET IMPLEMENTED)
// ============================================================================
// This feature would allow users to upload audio files for voice-based chat
// Using Whisper AI for speech-to-text transcription
// ============================================================================

// /**
//  * Handle voice chat uploads
//  *
//  * Accepts audio file, transcribes it using Whisper, and returns text
//  *
//  * @route POST /api/v1/josephine/voice-chat
//  * @access Private (Student role required)
//  * @file {File} audio - Audio file to transcribe
//  * @returns {Object} Transcription and file details
//  */
// exports.voiceChat = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({
//       message: "No audio file uploaded",
//       type: "error",
//     });
//   }
//
//   const transcription = await transcribeWithWhisper(req.file.path);
//
//   console.log("Audio file received", req.file);
//
//   res.status(200).send({
//     message: "File successfully uploaded",
//     type: "success",
//     transcription,
//     filename: req.file.filename,
//     path: req.file.path,
//     size: req.file.size,
//   });
// };

// /**
//  * Transcribe audio using OpenAI Whisper
//  *
//  * Spawns Whisper CLI process to convert audio to text
//  *
//  * @param {String} audioPath - Path to audio file
//  * @returns {Promise<String>} Transcribed text
//  */
// const transcribeWithWhisper = (audioPath) => {
//   return new Promise((resolve, reject) => {
//     // Spawn Whisper CLI process
//     const whisper = spawn("whipser", [ // NOTE: Typo in original - should be "whisper"
//       audioPath,
//       "--model",
//       "base",
//       "--output_format",
//       "txt",
//       "--output_dir",
//       "./uploads",
//     ]);
//
//     let output = "";
//
//     // Collect stdout data
//     whisper.stdout.on("data", (data) => {
//       output += data.toString();
//     });
//
//     // Handle process completion
//     whisper.on("close", (code) => {
//       if (code === 0) {
//         // Read the generated text file
//         const txtPath = audioPath.replace(path.extname(audioPath), ".txt");
//         const transcription = fs.readFileSync(txtPath, "utf-8");
//         fs.unlinkSync(txtPath); // Cleanup temporary file
//         resolve(transcription.trim());
//       } else {
//         reject(new Error("Whisper transcription failed"));
//       }
//     });
//   });
// };
