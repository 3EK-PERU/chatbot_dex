import { io } from 'socket.io-client';

var styles = "/* Variables CSS para theming */\r\n:host {\r\n  --primary-color: #007bff;\r\n  --secondary-color: #6c757d;\r\n  --bg-color: #ffffff;\r\n  --text-color: #333333;\r\n  --border-color: #e0e0e0;\r\n  --shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\r\n  --border-radius: 12px;\r\n  --transition: all 0.3s ease;\r\n  display: block;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n:host(.dark) {\r\n  --primary-color: #0d6efd;\r\n  --secondary-color: #6c757d;\r\n  --bg-color: #1e1e1e;\r\n  --text-color: #ffffff;\r\n  --border-color: #3a3a3a;\r\n  --shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\r\n}\r\n\r\n/* Container principal - fullscreen */\r\n.chatbot-container {\r\n  width: 100%;\r\n  height: 100%;\r\n  font-family:\r\n    -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\",\r\n    Arial, sans-serif;\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: var(--bg-color);\r\n}\r\n\r\n/* Ventana de chat - fullscreen */\r\n.chat-window {\r\n  width: 100%;\r\n  height: 100%;\r\n  background: var(--bg-color);\r\n  display: flex;\r\n  flex-direction: column;\r\n  overflow: hidden;\r\n}\r\n\r\n/* Header */\r\n.chat-header {\r\n  background: var(--primary-color);\r\n  color: white;\r\n  padding: 16px 24px;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\r\n  flex-shrink: 0;\r\n}\r\n\r\n.bot-name {\r\n  font-weight: 600;\r\n  font-size: 18px;\r\n}\r\n\r\n.close-btn {\r\n  background: transparent;\r\n  border: none;\r\n  color: white;\r\n  font-size: 24px;\r\n  cursor: pointer;\r\n  padding: 0;\r\n  width: 32px;\r\n  height: 32px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  border-radius: 50%;\r\n  transition: var(--transition);\r\n}\r\n\r\n.close-btn:hover {\r\n  background: rgba(255, 255, 255, 0.2);\r\n}\r\n\r\n/* Área de mensajes */\r\n.chat-messages {\r\n  flex: 1;\r\n  overflow-y: auto;\r\n  padding: 24px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 12px;\r\n  background: var(--bg-color);\r\n  min-height: 0;\r\n}\r\n\r\n.chat-messages::-webkit-scrollbar {\r\n  width: 6px;\r\n}\r\n\r\n.chat-messages::-webkit-scrollbar-track {\r\n  background: transparent;\r\n}\r\n\r\n.chat-messages::-webkit-scrollbar-thumb {\r\n  background: var(--border-color);\r\n  border-radius: 3px;\r\n}\r\n\r\n.chat-messages::-webkit-scrollbar-thumb:hover {\r\n  background: var(--secondary-color);\r\n}\r\n\r\n/* Mensajes */\r\n.message {\r\n  display: flex;\r\n  animation: fadeIn 0.3s ease;\r\n}\r\n\r\n@keyframes fadeIn {\r\n  from {\r\n    opacity: 0;\r\n    transform: translateY(10px);\r\n  }\r\n  to {\r\n    opacity: 1;\r\n    transform: translateY(0);\r\n  }\r\n}\r\n\r\n.message.user {\r\n  justify-content: flex-end;\r\n}\r\n\r\n.message.bot {\r\n  justify-content: flex-start;\r\n}\r\n\r\n.message-bubble {\r\n  max-width: 65%;\r\n  padding: 12px 16px;\r\n  border-radius: 18px;\r\n  word-wrap: break-word;\r\n  line-height: 1.5;\r\n  font-size: 15px;\r\n}\r\n\r\n.message.user .message-bubble {\r\n  background: var(--primary-color);\r\n  color: white;\r\n  border-bottom-right-radius: 4px;\r\n}\r\n\r\n.message.bot .message-bubble {\r\n  background: var(--border-color);\r\n  color: var(--text-color);\r\n  border-bottom-left-radius: 4px;\r\n}\r\n\r\n/* Tarjeta de auditoría */\r\n.audit-card {\r\n  width: 100%;\r\n}\r\n\r\n.audit-header {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 8px;\r\n  margin-bottom: 12px;\r\n  padding-bottom: 10px;\r\n  border-bottom: 1px solid rgba(0, 0, 0, 0.1);\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.audit-type {\r\n  font-weight: 700;\r\n  font-size: 15px;\r\n}\r\n\r\n.audit-status {\r\n  font-weight: 600;\r\n  font-size: 13px;\r\n  padding: 3px 10px;\r\n  border-radius: 12px;\r\n  text-transform: capitalize;\r\n}\r\n\r\n.audit-status.status-ok {\r\n  background: rgba(40, 167, 69, 0.15);\r\n  color: #155724;\r\n}\r\n\r\n.audit-status.status-error {\r\n  background: rgba(220, 53, 69, 0.15);\r\n  color: #721c24;\r\n}\r\n\r\n.audit-section {\r\n  margin-bottom: 10px;\r\n}\r\n\r\n.audit-section:last-child {\r\n  margin-bottom: 0;\r\n}\r\n\r\n.audit-section-title {\r\n  font-weight: 600;\r\n  font-size: 13px;\r\n  margin-bottom: 6px;\r\n}\r\n\r\n.audit-list {\r\n  margin: 0;\r\n  padding-left: 18px;\r\n  font-size: 13px;\r\n  line-height: 1.6;\r\n}\r\n\r\n.audit-list li {\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.audit-list li:last-child {\r\n  margin-bottom: 0;\r\n}\r\n\r\n.errors-list li::marker {\r\n  color: #dc3545;\r\n}\r\n\r\n.recommendations-list li::marker {\r\n  color: #007bff;\r\n}\r\n\r\n/* Burbuja más ancha para auditorías */\r\n.message.bot .message-bubble:has(.audit-card) {\r\n  max-width: 85%;\r\n}\r\n\r\n/* Indicador de escritura */\r\n.typing-indicator {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  padding: 10px 14px;\r\n  background: var(--border-color);\r\n  border-radius: 18px;\r\n  width: fit-content;\r\n}\r\n\r\n.typing-indicator span {\r\n  width: 8px;\r\n  height: 8px;\r\n  background: var(--secondary-color);\r\n  border-radius: 50%;\r\n  animation: typing 1.4s infinite;\r\n}\r\n\r\n.typing-indicator span:nth-child(2) {\r\n  animation-delay: 0.2s;\r\n}\r\n\r\n.typing-indicator span:nth-child(3) {\r\n  animation-delay: 0.4s;\r\n}\r\n\r\n@keyframes typing {\r\n  0%,\r\n  60%,\r\n  100% {\r\n    transform: translateY(0);\r\n    opacity: 0.7;\r\n  }\r\n  30% {\r\n    transform: translateY(-10px);\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n/* Input de mensaje */\r\n.chat-input {\r\n  padding: 16px 24px;\r\n  border-top: 1px solid var(--border-color);\r\n  background: var(--bg-color);\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 8px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.input-row {\r\n  display: flex;\r\n  gap: 8px;\r\n  align-items: center;\r\n}\r\n\r\n.chat-input input[type=\"text\"] {\r\n  flex: 1;\r\n  padding: 10px 14px;\r\n  border: 1px solid var(--border-color);\r\n  border-radius: 20px;\r\n  outline: none;\r\n  font-size: 14px;\r\n  background: var(--bg-color);\r\n  color: var(--text-color);\r\n  transition: var(--transition);\r\n}\r\n\r\n.chat-input input[type=\"text\"]:focus {\r\n  border-color: var(--primary-color);\r\n  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);\r\n}\r\n\r\n.chat-input input[type=\"text\"]::placeholder {\r\n  color: var(--secondary-color);\r\n}\r\n\r\n/* Botón adjuntar imagen */\r\n.attach-btn {\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 50%;\r\n  border: 1px solid var(--border-color);\r\n  background: var(--bg-color);\r\n  font-size: 18px;\r\n  cursor: pointer;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  transition: var(--transition);\r\n  flex-shrink: 0;\r\n}\r\n\r\n.attach-btn:hover {\r\n  background: var(--border-color);\r\n}\r\n\r\n.attach-btn:disabled {\r\n  opacity: 0.5;\r\n  cursor: not-allowed;\r\n}\r\n\r\n/* Botón preguntas frecuentes */\r\n.faq-btn {\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 50%;\r\n  border: 1px solid var(--border-color);\r\n  background: var(--bg-color);\r\n  font-size: 16px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  transition: var(--transition);\r\n  flex-shrink: 0;\r\n  color: var(--text-color);\r\n}\r\n\r\n.faq-btn:hover {\r\n  background: var(--border-color);\r\n}\r\n\r\n/* Vista previa de imagen */\r\n.image-preview {\r\n  display: inline-flex;\r\n  align-items: flex-start;\r\n  gap: 0;\r\n}\r\n\r\n.image-preview img {\r\n  display: inline-block;\r\n  max-width: 120px;\r\n  max-height: 80px;\r\n  border-radius: 8px;\r\n  object-fit: cover;\r\n  border: 1px solid var(--border-color);\r\n  vertical-align: top;\r\n}\r\n\r\n.remove-image-btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 22px;\r\n  height: 22px;\r\n  border-radius: 50%;\r\n  background: #dc3545;\r\n  color: white;\r\n  border: none;\r\n  font-size: 12px;\r\n  cursor: pointer;\r\n  line-height: 1;\r\n  margin-left: -11px;\r\n  margin-top: -4px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n/* Imágenes en mensajes */\r\n.message-image {\r\n  max-width: 100%;\r\n  max-height: 300px;\r\n  border-radius: 8px;\r\n  margin-bottom: 6px;\r\n  display: block;\r\n  object-fit: contain;\r\n}\r\n\r\n.send-btn {\r\n  padding: 10px 20px;\r\n  background: var(--primary-color);\r\n  color: white;\r\n  border: none;\r\n  border-radius: 20px;\r\n  cursor: pointer;\r\n  font-weight: 500;\r\n  transition: var(--transition);\r\n  min-width: 70px;\r\n  flex-shrink: 0;\r\n  white-space: nowrap;\r\n}\r\n\r\n.send-btn:hover {\r\n  background: #0056b3;\r\n  transform: translateY(-1px);\r\n}\r\n\r\n.send-btn:active {\r\n  transform: translateY(0);\r\n}\r\n\r\n.send-btn:disabled {\r\n  background: var(--secondary-color);\r\n  cursor: not-allowed;\r\n  opacity: 0.6;\r\n}\r\n\r\n/* Estado de conexión */\r\n.connection-status {\r\n  padding: 4px 12px;\r\n  font-size: 11px;\r\n  text-align: center;\r\n  background: rgba(255, 193, 7, 0.1);\r\n  color: #856404;\r\n}\r\n\r\n.connection-status.connected {\r\n  background: rgba(40, 167, 69, 0.1);\r\n  color: #155724;\r\n}\r\n\r\n.connection-status.disconnected {\r\n  background: rgba(220, 53, 69, 0.1);\r\n  color: #721c24;\r\n}\r\n\r\n/* Responsive */\r\n@media (max-width: 768px) {\r\n  .chat-header {\r\n    padding: 12px 16px;\r\n  }\r\n\r\n  .bot-name {\r\n    font-size: 16px;\r\n  }\r\n\r\n  .chat-messages {\r\n    padding: 16px;\r\n  }\r\n\r\n  .chat-input {\r\n    padding: 12px 16px;\r\n  }\r\n\r\n  .message-bubble {\r\n    max-width: 80%;\r\n    font-size: 14px;\r\n  }\r\n\r\n  .message-image {\r\n    max-height: 200px;\r\n  }\r\n\r\n  .image-preview img {\r\n    max-width: 100px;\r\n    max-height: 60px;\r\n  }\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .chat-header {\r\n    padding: 10px 12px;\r\n  }\r\n\r\n  .bot-name {\r\n    font-size: 15px;\r\n  }\r\n\r\n  .chat-messages {\r\n    padding: 12px;\r\n    gap: 8px;\r\n  }\r\n\r\n  .chat-input {\r\n    padding: 10px 12px;\r\n  }\r\n\r\n  .input-row {\r\n    gap: 6px;\r\n  }\r\n\r\n  .message-bubble {\r\n    max-width: 85%;\r\n    padding: 10px 12px;\r\n    font-size: 14px;\r\n  }\r\n\r\n  .send-btn {\r\n    padding: 10px 14px;\r\n    min-width: 64px;\r\n    font-size: 13px;\r\n    flex-shrink: 0;\r\n  }\r\n\r\n  .attach-btn,\r\n  .faq-btn {\r\n    width: 36px;\r\n    height: 36px;\r\n    font-size: 16px;\r\n    flex-shrink: 0;\r\n  }\r\n\r\n  .message-image {\r\n    max-height: 150px;\r\n  }\r\n\r\n  .close-btn {\r\n    width: 28px;\r\n    height: 28px;\r\n    font-size: 20px;\r\n  }\r\n}\r\n\r\n@media (max-width: 380px) {\r\n  .chat-input {\r\n    padding: 8px 10px;\r\n  }\r\n\r\n  .input-row {\r\n    gap: 5px;\r\n  }\r\n\r\n  .send-btn {\r\n    padding: 10px 10px;\r\n    min-width: 56px;\r\n    font-size: 13px;\r\n  }\r\n\r\n  .attach-btn,\r\n  .faq-btn {\r\n    width: 34px;\r\n    height: 34px;\r\n    font-size: 15px;\r\n  }\r\n\r\n  .chat-input input[type=\"text\"] {\r\n    padding: 10px 10px;\r\n    font-size: 13px;\r\n  }\r\n}\r\n";

class ChatbotAI extends HTMLElement {
    // Observar atributos
    static get observedAttributes() {
        return [
            "api-url",
            "bot-name",
            "theme",
            "session-id",
            "user-name",
            "user-phone",
            "welcome-message",
            "placeholder",
            "id-cliente",
        ];
    }
    constructor() {
        super();
        this.socket = null;
        // Propiedades configurables
        this.apiUrl = "http://localhost:3000";
        this.botName = "ChatBot AI";
        this.theme = "light";
        this.sessionId = "";
        this.userName = "Usuario";
        this.welcomeMessage = "¡Hola! ¿En qué puedo ayudarte?";
        this.placeholder = "Escribe un mensaje...";
        // Estado
        this.isTyping = false;
        this.connected = false;
        this.messages = [];
        this.pendingImage = null;
        this.initialized = false;
        // Referencias DOM cacheadas para evitar re-render completo
        this.containerEl = null;
        this.connectionStatusEl = null;
        this.botNameEl = null;
        this.messagesEl = null;
        this.imagePreviewEl = null;
        this.inputEl = null;
        this.sendBtnEl = null;
        this.attachBtnEl = null;
        this.faqBtnEl = null;
        this.fileInputEl = null;
        this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
        this.sessionId =
            this.getAttribute("session-id") || this.generateSessionId();
        if (!this.initialized) {
            this.render();
            this.attachEventListeners();
            this.initialized = true;
        }
        else {
            this.refreshUI();
        }
        this.connectSocket();
    }
    disconnectedCallback() {
        this.disconnectSocket();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        switch (name) {
            case "api-url":
                this.apiUrl = newValue;
                this.reconnectSocket();
                break;
            case "bot-name":
                this.botName = newValue;
                break;
            case "id-cliente":
                this.idCliente = newValue;
                break;
            case "theme":
                this.theme = newValue;
                break;
            case "user-name":
                this.userName = newValue;
                break;
            case "user-phone":
                this.userPhone = newValue;
                break;
            case "welcome-message":
                this.welcomeMessage = newValue;
                break;
            case "placeholder":
                this.placeholder = newValue;
                break;
        }
        this.refreshUI();
    }
    // API Pública
    open() {
        // Mantenido por compatibilidad - chatbot siempre visible
        this.dispatchEvent(new CustomEvent("chatbot-opened"));
    }
    close() {
        // Mantenido por compatibilidad - chatbot siempre visible
        this.dispatchEvent(new CustomEvent("chatbot-closed"));
    }
    toggle() {
        // No-op en modo fullscreen
    }
    sendMessage(text) {
        this.handleSendMessage(text);
    }
    clearHistory() {
        this.messages = [];
        this.updateMessages();
        this.dispatchEvent(new CustomEvent("chatbot-history-cleared"));
    }
    getMessages() {
        return [...this.messages];
    }
    // Conexión Socket.io
    connectSocket() {
        if (this.socket)
            return;
        this.socket = io(this.apiUrl, {
            query: { sessionId: this.sessionId },
            transports: ["websocket", "polling"],
        });
        this.socket.on("connect", () => {
            console.log("✅ Chatbot conectado al servidor");
            this.connected = true;
            this.updateConnectionState();
            this.dispatchEvent(new CustomEvent("chatbot-connected"));
            // Mostrar mensaje de bienvenida
            if (this.messages.length === 0 && this.welcomeMessage) {
                this.addMessage(this.welcomeMessage, "bot");
                this.updateMessages();
                this.scrollToBottom();
            }
        });
        this.socket.on("disconnect", () => {
            console.log("❌ Chatbot desconectado");
            this.connected = false;
            this.updateConnectionState();
            this.dispatchEvent(new CustomEvent("chatbot-disconnected"));
        });
        this.socket.on("message:receive", (message) => {
            this.addMessage(message.text, "bot");
            this.isTyping = false;
            this.updateMessages();
            this.scrollToBottom();
        });
        this.socket.on("bot:typing", (data) => {
            this.isTyping = data.isTyping;
            this.updateMessages();
            if (data.isTyping) {
                this.scrollToBottom();
            }
        });
        this.socket.on("message:error", (data) => {
            console.error("Error del chatbot:", data.error);
            this.isTyping = false;
            this.updateMessages();
            this.dispatchEvent(new CustomEvent("chatbot-error", { detail: data.error }));
        });
        this.socket.on("connect_error", (error) => {
            console.error("Error de conexión:", error);
            this.connected = false;
            this.updateConnectionState();
        });
    }
    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }
    reconnectSocket() {
        this.disconnectSocket();
        this.connectSocket();
    }
    handleSendMessage(text) {
        const trimmedText = text.trim();
        if ((!trimmedText && !this.pendingImage) || !this.socket || !this.connected)
            return;
        // Agregar mensaje del usuario (con imagen si existe)
        this.addMessage(trimmedText || "📷 Imagen enviada", "user", this.pendingImage?.previewUrl);
        // Enviar al servidor
        const payload = {
            text: trimmedText,
            userName: this.userName,
            userPhone: this.userPhone,
            idCliente: this.idCliente,
        };
        if (this.pendingImage) {
            payload.image = this.pendingImage.base64;
            payload.imageMimeType = this.pendingImage.mimeType;
        }
        this.socket.emit("message:send", payload);
        // Limpiar imagen pendiente
        this.pendingImage = null;
        this.updatePendingImagePreview();
        this.updateMessages();
        this.scrollToBottom();
        // Limpiar input
        if (this.inputEl) {
            this.inputEl.value = "";
        }
    }
    addMessage(text, sender, imageUrl) {
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text,
            sender,
            timestamp: new Date(),
            imageUrl,
        };
        this.messages.push(message);
        this.dispatchEvent(new CustomEvent("chatbot-message", {
            detail: { text, sender, timestamp: message.timestamp },
        }));
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    scrollToBottom() {
        setTimeout(() => {
            if (this.messagesEl) {
                this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
            }
        }, 100);
    }
    // Render
    render() {
        this.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="chatbot-container ${this.theme}">
        ${this.renderChatWindow()}
      </div>
    `;
        this.cacheDomRefs();
        this.refreshUI();
    }
    renderChatWindow() {
        return `
      <div class="chat-window">
        <div class="connection-status disconnected" data-role="connection-status">
          Conectando al servidor...
        </div>
        <div class="chat-header">
          <span class="bot-name" data-role="bot-name">${this.escapeHtml(this.botName)}</span>
        </div>
        <div class="chat-messages" data-role="messages"></div>
        <div class="chat-input">
          <div data-role="image-preview"></div>
          <div class="input-row">
            <button
              class="attach-btn"
              data-action="attach"
              title="Adjuntar imagen"
              ${!this.connected ? "disabled" : ""}
            >
              📎
            </button>
            <button
              class="faq-btn"
              data-action="faq"
              title="Preguntas frecuentes"
            >
              ?
            </button>
            <input
              type="text"
              placeholder="${this.escapeHtml(this.placeholder)}"
              data-input="message"
              ${!this.connected ? "disabled" : ""}
            />
            <button
              class="send-btn"
              data-action="send"
              ${!this.connected ? "disabled" : ""}
            >
              Enviar
            </button>
          </div>
          <input type="file" data-input="file" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none" />
        </div>
      </div>
    `;
    }
    renderMessages() {
        return this.messages
            .map((msg) => `
      <div class="message ${msg.sender}">
        <div class="message-bubble">
          ${msg.imageUrl ? `<img class="message-image" src="${msg.imageUrl}" alt="Imagen" />` : ""}
          ${msg.sender === "bot" ? this.formatBotMessage(msg.text) : this.escapeHtml(msg.text)}
        </div>
      </div>
    `)
            .join("");
    }
    renderTypingIndicator() {
        return `
      <div class="message bot">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    }
    renderImagePreview() {
        return `
      <div class="image-preview">
        <img src="${this.pendingImage?.previewUrl}" alt="Vista previa" />
        <button class="remove-image-btn" data-action="remove-image" title="Quitar imagen">✕</button>
      </div>
    `;
    }
    cacheDomRefs() {
        this.containerEl = this.shadow.querySelector(".chatbot-container");
        this.connectionStatusEl = this.shadow.querySelector('[data-role="connection-status"]');
        this.botNameEl = this.shadow.querySelector('[data-role="bot-name"]');
        this.messagesEl = this.shadow.querySelector('[data-role="messages"]');
        this.imagePreviewEl = this.shadow.querySelector('[data-role="image-preview"]');
        this.inputEl = this.shadow.querySelector('[data-input="message"]');
        this.sendBtnEl = this.shadow.querySelector('[data-action="send"]');
        this.attachBtnEl = this.shadow.querySelector('[data-action="attach"]');
        this.faqBtnEl = this.shadow.querySelector('[data-action="faq"]');
        this.fileInputEl = this.shadow.querySelector('[data-input="file"]');
    }
    refreshUI() {
        this.updateTheme();
        this.updateHeader();
        this.updateConnectionState();
        this.updateInputState();
        this.updatePendingImagePreview();
        this.updateMessages();
    }
    updateTheme() {
        if (!this.containerEl)
            return;
        this.containerEl.classList.remove("light", "dark");
        this.containerEl.classList.add(this.theme);
    }
    updateHeader() {
        if (this.botNameEl) {
            this.botNameEl.textContent = this.botName;
        }
    }
    updateConnectionState() {
        if (this.connectionStatusEl) {
            this.connectionStatusEl.style.display = this.connected ? "none" : "block";
        }
        this.updateInputState();
    }
    updateInputState() {
        if (this.inputEl) {
            this.inputEl.disabled = !this.connected;
            this.inputEl.placeholder = this.placeholder;
        }
        if (this.sendBtnEl) {
            this.sendBtnEl.disabled = !this.connected;
        }
        if (this.attachBtnEl) {
            this.attachBtnEl.disabled = !this.connected;
        }
    }
    updateMessages() {
        if (!this.messagesEl)
            return;
        this.messagesEl.innerHTML = `${this.renderMessages()}${this.isTyping ? this.renderTypingIndicator() : ""}`;
    }
    updatePendingImagePreview() {
        if (!this.imagePreviewEl)
            return;
        this.imagePreviewEl.innerHTML = this.pendingImage
            ? this.renderImagePreview()
            : "";
    }
    attachEventListeners() {
        if (this.sendBtnEl && this.inputEl) {
            this.sendBtnEl.addEventListener("click", () => {
                this.handleSendMessage(this.inputEl?.value || "");
            });
        }
        if (this.attachBtnEl && this.fileInputEl) {
            this.attachBtnEl.addEventListener("click", () => {
                this.fileInputEl?.click();
            });
        }
        if (this.faqBtnEl) {
            this.faqBtnEl.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("chatbot-faq-open", {
                    bubbles: true,
                    composed: true,
                }));
            });
        }
        if (this.fileInputEl) {
            this.fileInputEl.addEventListener("change", (e) => {
                const file = e.target.files?.[0];
                if (!file)
                    return;
                this.handleImageSelected(file);
                if (this.fileInputEl) {
                    this.fileInputEl.value = "";
                }
            });
        }
        if (this.imagePreviewEl) {
            this.imagePreviewEl.addEventListener("click", (e) => {
                const target = e.target;
                if (target.dataset.action === "remove-image") {
                    this.pendingImage = null;
                    this.updatePendingImagePreview();
                }
            });
        }
        if (this.inputEl) {
            this.inputEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage(this.inputEl?.value || "");
                }
            });
        }
    }
    handleImageSelected(file) {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            alert("Tipo de imagen no soportado. Usa JPEG, PNG, GIF o WebP.");
            return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert("La imagen es demasiado grande. El máximo es 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            // Extract base64 data (remove "data:image/xxx;base64," prefix)
            const base64 = dataUrl.split(",")[1];
            this.pendingImage = {
                base64,
                mimeType: file.type,
                previewUrl: dataUrl,
            };
            this.updatePendingImagePreview();
        };
        reader.readAsDataURL(file);
    }
    formatBotMessage(text) {
        // Intentar parsear como JSON de auditoría
        const jsonMatch = text.match(/\{[\s\S]*"tipo_mueble"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[0]);
                if (data.tipo_mueble && data.estado) {
                    return this.renderAuditCard(data);
                }
            }
            catch (_) {
                // No es JSON válido, renderizar como texto
            }
        }
        return this.escapeHtml(text);
    }
    renderAuditCard(data) {
        const isCorrect = data.estado.toLowerCase().includes("correcto") &&
            !data.estado.toLowerCase().includes("incorrecto");
        const statusClass = isCorrect ? "status-ok" : "status-error";
        const statusIcon = isCorrect ? "✅" : "❌";
        let html = `<div class="audit-card">`;
        // Header
        html += `<div class="audit-header">`;
        html += `<span class="audit-type">📋 ${this.escapeHtml(data.tipo_mueble)}</span>`;
        html += `<span class="audit-status ${statusClass}">${statusIcon} ${this.escapeHtml(data.estado)}</span>`;
        html += `</div>`;
        // Errores
        if (data.errores && data.errores.length > 0) {
            html += `<div class="audit-section">`;
            html += `<div class="audit-section-title">⚠️ Errores encontrados</div>`;
            html += `<ul class="audit-list errors-list">`;
            for (const error of data.errores) {
                html += `<li>${this.escapeHtml(error)}</li>`;
            }
            html += `</ul></div>`;
        }
        // Recomendaciones
        if (data.recomendaciones && data.recomendaciones.length > 0) {
            html += `<div class="audit-section">`;
            html += `<div class="audit-section-title">💡 Recomendaciones</div>`;
            html += `<ul class="audit-list recommendations-list">`;
            for (const rec of data.recomendaciones) {
                html += `<li>${this.escapeHtml(rec)}</li>`;
            }
            html += `</ul></div>`;
        }
        html += `</div>`;
        return html;
    }
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
// Registrar el Custom Element
customElements.define("chatbot-ai", ChatbotAI);

export { ChatbotAI };
