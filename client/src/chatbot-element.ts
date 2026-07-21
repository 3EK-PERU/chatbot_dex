import { io, Socket } from "socket.io-client";
import styles from "./styles/base.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  imageUrl?: string;
}

export class ChatbotAI extends HTMLElement {
  // Shadow DOM
  private shadow: ShadowRoot;
  private socket: Socket | null = null;

  // Propiedades configurables
  private apiUrl: string = "http://localhost:3000";
  private botName: string = "ChatBot AI";
  private theme: "light" | "dark" = "light";
  private sessionId: string = "";
  private userName: string = "Usuario";
  private userPhone?: string;
  private idCliente?: string;
  private welcomeMessage: string = "¡Hola! ¿En qué puedo ayudarte?";
  private placeholder: string = "Escribe un mensaje...";

  // Estado
  private isTyping: boolean = false;
  private connected: boolean = false;
  private messages: Message[] = [];
  private pendingImage: {
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null = null;
  private initialized: boolean = false;

  // Referencias DOM cacheadas para evitar re-render completo
  private containerEl: HTMLElement | null = null;
  private connectionStatusEl: HTMLElement | null = null;
  private botNameEl: HTMLElement | null = null;
  private messagesEl: HTMLElement | null = null;
  private imagePreviewEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private sendBtnEl: HTMLButtonElement | null = null;
  private attachBtnEl: HTMLButtonElement | null = null;
  private faqBtnEl: HTMLButtonElement | null = null;
  private fileInputEl: HTMLInputElement | null = null;

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
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.sessionId =
      this.getAttribute("session-id") || this.generateSessionId();

    if (!this.initialized) {
      this.render();
      this.attachEventListeners();
      this.initialized = true;
    } else {
      this.refreshUI();
    }

    this.connectSocket();
  }

  disconnectedCallback() {
    this.disconnectSocket();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

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
        this.theme = newValue as "light" | "dark";
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
  public open(): void {
    // Mantenido por compatibilidad - chatbot siempre visible
    this.dispatchEvent(new CustomEvent("chatbot-opened"));
  }

  public close(): void {
    // Mantenido por compatibilidad - chatbot siempre visible
    this.dispatchEvent(new CustomEvent("chatbot-closed"));
  }

  public toggle(): void {
    // No-op en modo fullscreen
  }

  public sendMessage(text: string): void {
    this.handleSendMessage(text);
  }

  public clearHistory(): void {
    this.messages = [];
    this.updateMessages();
    this.dispatchEvent(new CustomEvent("chatbot-history-cleared"));
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }

  // Conexión Socket.io
  private connectSocket(): void {
    if (this.socket) return;

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

    this.socket.on("message:receive", (message: any) => {
      this.addMessage(message.text, "bot");
      this.isTyping = false;
      this.updateMessages();
      this.scrollToBottom();
    });

    this.socket.on("bot:typing", (data: { isTyping: boolean }) => {
      this.isTyping = data.isTyping;
      this.updateMessages();
      if (data.isTyping) {
        this.scrollToBottom();
      }
    });

    this.socket.on("message:error", (data: { error: string }) => {
      console.error("Error del chatbot:", data.error);
      this.isTyping = false;
      this.updateMessages();
      this.dispatchEvent(
        new CustomEvent("chatbot-error", { detail: data.error }),
      );
    });

    this.socket.on("connect_error", (error) => {
      console.error("Error de conexión:", error);
      this.connected = false;
      this.updateConnectionState();
    });
  }

  private disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  private reconnectSocket(): void {
    this.disconnectSocket();
    this.connectSocket();
  }

  private handleSendMessage(text: string): void {
    const trimmedText = text.trim();
    if ((!trimmedText && !this.pendingImage) || !this.socket || !this.connected)
      return;

    // Agregar mensaje del usuario (con imagen si existe)
    this.addMessage(
      trimmedText || "📷 Imagen enviada",
      "user",
      this.pendingImage?.previewUrl,
    );

    // Enviar al servidor
    const payload: any = {
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

  private addMessage(
    text: string,
    sender: "user" | "bot",
    imageUrl?: string,
  ): void {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender,
      timestamp: new Date(),
      imageUrl,
    };
    this.messages.push(message);
    this.dispatchEvent(
      new CustomEvent("chatbot-message", {
        detail: { text, sender, timestamp: message.timestamp },
      }),
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesEl) {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      }
    }, 100);
  }

  // Render
  private render(): void {
    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="chatbot-container ${this.theme}">
        ${this.renderChatWindow()}
      </div>
    `;
    this.cacheDomRefs();
    this.refreshUI();
  }

  private renderChatWindow(): string {
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

  private renderMessages(): string {
    return this.messages
      .map(
        (msg) => `
      <div class="message ${msg.sender}">
        <div class="message-bubble">
          ${msg.imageUrl ? `<img class="message-image" src="${msg.imageUrl}" alt="Imagen" />` : ""}
          ${msg.sender === "bot" ? this.formatBotMessage(msg.text) : this.escapeHtml(msg.text)}
        </div>
      </div>
    `,
      )
      .join("");
  }

  private renderTypingIndicator(): string {
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

  private renderImagePreview(): string {
    return `
      <div class="image-preview">
        <img src="${this.pendingImage?.previewUrl}" alt="Vista previa" />
        <button class="remove-image-btn" data-action="remove-image" title="Quitar imagen">✕</button>
      </div>
    `;
  }

  private cacheDomRefs(): void {
    this.containerEl = this.shadow.querySelector(".chatbot-container");
    this.connectionStatusEl = this.shadow.querySelector(
      '[data-role="connection-status"]',
    );
    this.botNameEl = this.shadow.querySelector('[data-role="bot-name"]');
    this.messagesEl = this.shadow.querySelector('[data-role="messages"]');
    this.imagePreviewEl = this.shadow.querySelector(
      '[data-role="image-preview"]',
    );
    this.inputEl = this.shadow.querySelector('[data-input="message"]');
    this.sendBtnEl = this.shadow.querySelector('[data-action="send"]');
    this.attachBtnEl = this.shadow.querySelector('[data-action="attach"]');
    this.faqBtnEl = this.shadow.querySelector('[data-action="faq"]');
    this.fileInputEl = this.shadow.querySelector('[data-input="file"]');
  }

  private refreshUI(): void {
    this.updateTheme();
    this.updateHeader();
    this.updateConnectionState();
    this.updateInputState();
    this.updatePendingImagePreview();
    this.updateMessages();
  }

  private updateTheme(): void {
    if (!this.containerEl) return;
    this.containerEl.classList.remove("light", "dark");
    this.containerEl.classList.add(this.theme);
  }

  private updateHeader(): void {
    if (this.botNameEl) {
      this.botNameEl.textContent = this.botName;
    }
  }

  private updateConnectionState(): void {
    if (this.connectionStatusEl) {
      this.connectionStatusEl.style.display = this.connected ? "none" : "block";
    }
    this.updateInputState();
  }

  private updateInputState(): void {
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

  private updateMessages(): void {
    if (!this.messagesEl) return;
    this.messagesEl.innerHTML = `${this.renderMessages()}${this.isTyping ? this.renderTypingIndicator() : ""}`;
  }

  private updatePendingImagePreview(): void {
    if (!this.imagePreviewEl) return;
    this.imagePreviewEl.innerHTML = this.pendingImage
      ? this.renderImagePreview()
      : "";
  }

  private attachEventListeners(): void {
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
        this.dispatchEvent(
          new CustomEvent("chatbot-faq-open", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }

    if (this.fileInputEl) {
      this.fileInputEl.addEventListener("change", (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        this.handleImageSelected(file);
        if (this.fileInputEl) {
          this.fileInputEl.value = "";
        }
      });
    }

    if (this.imagePreviewEl) {
      this.imagePreviewEl.addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.dataset.action === "remove-image") {
          this.pendingImage = null;
          this.updatePendingImagePreview();
        }
      });
    }

    if (this.inputEl) {
      this.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage(this.inputEl?.value || "");
        }
      });
    }
  }

  private handleImageSelected(file: File): void {
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
      const dataUrl = reader.result as string;
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

  private formatBotMessage(text: string): string {
    // Intentar parsear como JSON de auditoría
    const jsonMatch = text.match(/\{[\s\S]*"tipo_mueble"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        if (data.tipo_mueble && data.estado) {
          return this.renderAuditCard(data);
        }
      } catch (_) {
        // No es JSON válido, renderizar como texto
      }
    }
    return this.escapeHtml(text);
  }

  private renderAuditCard(data: any): string {
    const isCorrect =
      data.estado.toLowerCase().includes("correcto") &&
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

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Registrar el Custom Element
customElements.define("chatbot-ai", ChatbotAI);
