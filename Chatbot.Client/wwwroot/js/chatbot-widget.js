(function () {
  class ChatbotWidget {
    constructor(root) {
      this.root = root;
      this.connection = null;
      this.connected = false;
      this.isTyping = false;
      this.messages = [];
      this.hubUrl = root.dataset.hubUrl || "/hubs/audit-chat";
      this.botName = root.dataset.botName || "ChatBot AI";
      this.sessionId = root.dataset.sessionId || this.generateSessionId();
      this.userName = root.dataset.userName || "Usuario";
      this.userPhone = root.dataset.userPhone || "";
      this.idCliente = root.dataset.idCliente || "";
      this.welcomeMessage = root.dataset.welcomeMessage || "¡Hola! ¿En qué puedo ayudarte?";
      this.placeholder = root.dataset.placeholder || "Escribe un mensaje...";

      this.cacheDom();
      this.bindEvents();
      this.refreshUi();
      this.connectHub();
    }

    cacheDom() {
      this.statusEl = this.root.querySelector('[data-role="connection-status"]');
      this.botNameEl = this.root.querySelector('[data-role="bot-name"]');
      this.messagesEl = this.root.querySelector('[data-role="messages"]');
      this.inputEl = this.root.querySelector('[data-input="message"]');
      this.sendBtnEl = this.root.querySelector('[data-action="send"]');
      this.attachBtnEl = this.root.querySelector('[data-action="attach"]');
      this.faqBtnEl = this.root.querySelector('[data-action="faq"]');
      this.fileInputEl = this.root.querySelector('[data-input="file"]');
    }

    bindEvents() {
      if (this.sendBtnEl) {
        this.sendBtnEl.addEventListener('click', () => {
          this.handleSendMessage(this.inputEl ? this.inputEl.value : '');
        });
      }

      if (this.attachBtnEl) {
        this.attachBtnEl.addEventListener('click', () => {
          window.alert('Los adjuntos todavía no están expuestos por el hub SignalR.');
        });
      }

      if (this.faqBtnEl) {
        this.faqBtnEl.addEventListener('click', () => {
          this.root.dispatchEvent(new CustomEvent('chatbot-faq-open', { bubbles: true, composed: true }));
        });
      }

      if (this.fileInputEl) {
        this.fileInputEl.addEventListener('change', () => {
          this.fileInputEl.value = '';
          window.alert('Los adjuntos todavía no están expuestos por el hub SignalR.');
        });
      }

      if (this.inputEl) {
        this.inputEl.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage(this.inputEl.value);
          }
        });
      }
    }

    refreshUi() {
      if (this.botNameEl) {
        this.botNameEl.textContent = this.botName;
      }

      if (this.inputEl) {
        this.inputEl.placeholder = this.placeholder;
      }

      this.updateConnectionState('Conectando al servidor...');
      this.renderMessages();
      this.updateInputState();
    }

    updateConnectionState(message) {
      if (!this.statusEl) {
        return;
      }

      this.statusEl.classList.remove('chatbot-status-connected', 'chatbot-status-disconnected', 'chatbot-status-connecting');

      if (this.connected) {
        this.statusEl.classList.add('chatbot-status-connected');
        this.statusEl.textContent = message || 'Conectado al servidor';
      } else {
        this.statusEl.classList.add('chatbot-status-disconnected');
        this.statusEl.textContent = message || 'Conectando al servidor...';
      }
    }

    updateInputState() {
      const enabled = this.connected;
      if (this.inputEl) {
        this.inputEl.disabled = !enabled;
      }

      if (this.sendBtnEl) {
        this.sendBtnEl.disabled = !enabled;
      }

      if (this.attachBtnEl) {
        this.attachBtnEl.disabled = true;
        this.attachBtnEl.title = 'Los adjuntos no están disponibles con SignalR';
      }
    }

    connectHub() {
      if (typeof window.signalR === 'undefined' || !window.signalR.HubConnectionBuilder) {
        this.renderConnectionFallback('SignalR no está disponible en esta página');
        return;
      }

      this.connection = new window.signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .withAutomaticReconnect()
        .build();

      this.connection.on('MessageReceived', (response) => {
        const messageText = this.readMessageText(response);
        this.addMessage(messageText || 'Sin respuesta', 'bot');
        this.isTyping = false;
        this.renderMessages();
        this.scrollToBottom();
      });

      this.connection.onreconnecting(() => {
        this.connected = false;
        this.updateConnectionState('Reintentando conexión...');
        this.updateInputState();
      });

      this.connection.onreconnected(() => {
        this.joinSession();
      });

      this.connection.onclose(() => {
        this.connected = false;
        this.updateConnectionState('Conexión cerrada');
        this.updateInputState();
      });

      this.connection.start()
        .then(() => this.joinSession())
        .catch((error) => {
          this.renderConnectionFallback(error && error.message ? error.message : 'No se pudo conectar al hub');
        });
    }

    joinSession() {
      if (!this.connection) {
        return;
      }

      this.connection.invoke('JoinSession', this.sessionId)
        .then(() => {
          this.connected = true;
          this.updateConnectionState('Conectado al servidor');
          this.updateInputState();

          if (this.messages.length === 0 && this.welcomeMessage) {
            this.addMessage(this.welcomeMessage, 'bot');
            this.renderMessages();
            this.scrollToBottom();
          }
        })
        .catch((error) => {
          this.renderConnectionFallback(error && error.message ? error.message : 'No se pudo unir a la sesión');
        });
    }

    renderConnectionFallback(message) {
      this.connected = false;
      if (this.statusEl) {
        this.statusEl.classList.remove('chatbot-status-connected', 'chatbot-status-connecting');
        this.statusEl.classList.add('chatbot-status-disconnected');
        this.statusEl.textContent = message || 'No se pudo conectar al backend';
      }
      this.updateInputState();
    }

    readMessageText(response) {
      if (!response) {
        return '';
      }

      return response.message || response.Message || response.text || response.Text || '';
    }

    handleSendMessage(text) {
      const trimmedText = (text || '').trim();
      if (!trimmedText || !this.connection || !this.connected) {
        return;
      }

      this.addMessage(trimmedText, 'user');
      this.isTyping = true;
      this.renderMessages();
      this.scrollToBottom();

      this.connection.invoke('SendMessage', this.sessionId, trimmedText)
        .catch((error) => {
          this.isTyping = false;
          this.renderMessages();
          this.renderConnectionFallback(error && error.message ? error.message : 'No se pudo enviar el mensaje');
        });

      if (this.inputEl) {
        this.inputEl.value = '';
      }
    }

    addMessage(text, sender, imageUrl) {
      this.messages.push({
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11),
        text: text,
        sender: sender,
        timestamp: new Date(),
        imageUrl: imageUrl,
      });
    }

    renderMessages() {
      if (!this.messagesEl) {
        return;
      }

      let html = '';

      for (const message of this.messages) {
        html += '<div class="chatbot-message chatbot-message-' + message.sender + '">';
        html += '<div class="chatbot-bubble">';
        if (message.imageUrl) {
          html += '<img class="chatbot-message-image" src="' + message.imageUrl + '" alt="Imagen" />';
        }
        html += message.sender === 'bot' ? this.formatBotMessage(message.text) : this.escapeHtml(message.text);
        html += '</div></div>';
      }

      if (this.isTyping) {
        html += '<div class="chatbot-message chatbot-message-bot"><div class="chatbot-typing"><span></span><span></span><span></span></div></div>';
      }

      this.messagesEl.innerHTML = html;
    }

    formatBotMessage(text) {
      const match = text && text.match(/\{[\s\S]*"tipo_mueble"[\s\S]*\}/);
      if (match) {
        try {
          const data = JSON.parse(match[0]);
          if (data.tipo_mueble && data.estado) {
            return this.renderAuditCard(data);
          }
        } catch (error) {
          return this.escapeHtml(text);
        }
      }

      return this.escapeHtml(text);
    }

    renderAuditCard(data) {
      const estado = String(data.estado || '').toLowerCase();
      const isCorrect = estado.indexOf('correcto') >= 0 && estado.indexOf('incorrecto') < 0;

      let html = '<div class="chatbot-audit-card">';
      html += '<div class="chatbot-audit-header">';
      html += '<span class="chatbot-audit-type">📋 ' + this.escapeHtml(data.tipo_mueble) + '</span>';
      html += '<span class="chatbot-audit-status ' + (isCorrect ? 'is-ok' : 'is-error') + '">' + (isCorrect ? '✅ ' : '❌ ') + this.escapeHtml(data.estado) + '</span>';
      html += '</div>';

      if (Array.isArray(data.errores) && data.errores.length > 0) {
        html += '<div class="chatbot-audit-section"><div class="chatbot-audit-section-title">⚠️ Errores encontrados</div><ul class="chatbot-audit-list">';
        for (const error of data.errores) {
          html += '<li>' + this.escapeHtml(error) + '</li>';
        }
        html += '</ul></div>';
      }

      if (Array.isArray(data.recomendaciones) && data.recomendaciones.length > 0) {
        html += '<div class="chatbot-audit-section"><div class="chatbot-audit-section-title">💡 Recomendaciones</div><ul class="chatbot-audit-list">';
        for (const recommendation of data.recomendaciones) {
          html += '<li>' + this.escapeHtml(recommendation) + '</li>';
        }
        html += '</ul></div>';
      }

      html += '</div>';
      return html;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text == null ? '' : String(text);
      return div.innerHTML;
    }

    scrollToBottom() {
      window.setTimeout(() => {
        if (this.messagesEl) {
          this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        }
      }, 40);
    }

    generateSessionId() {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }

      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  function bootstrap() {
    document.querySelectorAll('[data-chatbot-widget]').forEach((root) => new ChatbotWidget(root));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
