/**
 * Josephine Routes
 * 
 * Defines API endpoints for the Josephine AI chatbot functionality.
 * All routes require authentication and student role authorization.
 * 
 * Base path: /api/v1/josephine
 */

const router = require("express").Router();
const controller = require("../controllers/josephine.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { uploadChatAttachment } = require("../middleware/upload.middleware");

/**
 * Global middleware for all Josephine routes
 * 
 * 1. authenticateToken - Verifies JWT token and attaches user to request
 * 2. authorizeRoles("student") - Ensures user has "student" role
 * 
 * All routes defined below this middleware will require authentication
 * and student authorization.
 */
router.use(authenticateToken, authorizeRoles("student"));

/**
 * @route   GET /api/v1/josephine/chats
 * @desc    Retrieve all chats for the authenticated user
 * @access  Private (Student)
 * @returns {Array} List of chat objects
 */
router.get("/chats", controller.listChats);
router.delete("/chats", controller.batchDelete);

/**
 * @route   POST /api/v1/josephine/prompt
 * @desc    Send a prompt/message to the AI chatbot
 * @access  Private (Student)
 * @body    {String} prompt - User's message/question
 * @body    {String} [chatId] - Optional chat ID to continue conversation
 * @files   {Array} [files] - Optional PDF attachments (multipart/form-data)
 * @returns {Object} Chat object with AI response
 * 
 * Notes:
 * - Supports file uploads via multipart/form-data
 * - uploadChatAttachment middleware handles file processing
 * - Multiple files can be uploaded in a single request
 * - Creates new chat if chatId is not provided
 */
router.post(
  "/prompt",
  uploadChatAttachment.array("files"), // Process multiple file uploads
  controller.sendPrompt
);

/**
 * @route   GET /api/v1/josephine/chat/:id
 * @desc    Retrieve a specific chat by ID
 * @access  Private (Student)
 * @param   {String} id - Chat document ID
 * @returns {Object} Complete chat object with conversation history
 * 
 * Authorization checks:
 * - User must own the chat OR
 * - Chat must be set to public access
 */
router.get("/chat/:id", controller.getChat);

/**
 * @route   DELETE /api/v1/josephine/chat/:id
 * @desc    Soft delete a chat
 * @access  Private (Student)
 * @param   {String} id - Chat document ID
 * @returns {Object} Success message
 * 
 * Note: This is a soft delete - the chat is marked as deleted
 * but remains in the database for potential recovery
 */
router.delete("/chat/:id", controller.deleteChat);

/**
 * @route   PATCH /api/v1/josephine/chat/:id
 * @desc    Modify chat properties (star, title, access level)
 * @access  Private (Student)
 * @param   {String} id - Chat document ID
 * @body    {Object} details - Object containing modification flags
 * @body    {Boolean} [details.changeStar] - Toggle starred status
 * @body    {String} [details.newName] - New chat title
 * @body    {Boolean} [details.changeAccess] - Toggle public/private access
 * @returns {Object} Success message
 */
router.patch("/chat/:id", controller.modifyChat);

// ============================================================================
// VOICE CHAT ROUTE (COMMENTED OUT - FEATURE NOT YET IMPLEMENTED)
// ============================================================================
// Future feature: Allow users to send voice messages to the chatbot
// Will use Whisper AI for speech-to-text transcription
// ============================================================================

/**
 * @route   POST /api/v1/josephine/voice-chat
 * @desc    Upload and transcribe voice message (NOT YET IMPLEMENTED)
 * @access  Private (Student)
 * @file    {File} audio - Audio file to transcribe
 * @returns {Object} Transcription text and file details
 */
// router.post("/voice-chat", voiceUpload.single("audio"), controller.voiceChat);

/**
 * Export the router
 * 
 * This router is mounted in server.js at /api/v1/josephine
 * Example full paths:
 * - GET /api/v1/josephine/chats
 * - POST /api/v1/josephine/prompt
 * - GET /api/v1/josephine/chat/:id
 * - DELETE /api/v1/josephine/chat/:id
 * - PATCH /api/v1/josephine/chat/:id
 */
module.exports = router;