/**
 * Token Manager Script para Swagger UI
 * 
 * Funcionalidades:
 * - Intercepta respuestas de login/register/refresh
 * - Auto-captura tokens y los guarda en localStorage
 * - Aplica automáticamente al Bearer scheme de Swagger
 * - Panel visual con estado, expiración y acciones
 * - Auto-refresca la UI cada 30 segundos
 */

export function getTokenManagerScript(): string {
    return `
<script>
(function() {
  // ==================== TOKEN MANAGER ====================
  const TokenManager = {
    storageKeys: {
      token: 'api_token',
      refreshToken: 'api_refresh_token',
      expiresAt: 'api_token_expires'
    },

    // Guardar tokens en localStorage
    save(accessToken, refreshToken, expiresIn = 3600) {
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      localStorage.setItem(this.storageKeys.token, accessToken);
      localStorage.setItem(this.storageKeys.refreshToken, refreshToken || '');
      localStorage.setItem(this.storageKeys.expiresAt, expiresAt);
      console.log('✓ Token guardado en localStorage');
      this.applyToSwagger(accessToken);
    },

    // Obtener token actual
    get() {
      return localStorage.getItem(this.storageKeys.token);
    },

    // Verificar si el token es válido
    isValid() {
      const expiresAt = localStorage.getItem(this.storageKeys.expiresAt);
      if (!expiresAt) return false;
      return new Date(expiresAt) > new Date();
    },

    // Aplicar token a Swagger UI
    applyToSwagger(token) {
      setTimeout(() => {
        const authorizeBtn = document.querySelector('[aria-label="Authorize"]') || 
                            document.querySelector('button:containing("Authorize")');
        const authHeader = document.querySelector('input[placeholder*="Bearer"]');
        
        if (authHeader) {
          authHeader.value = token;
          authHeader.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✓ Token aplicado a Swagger Authorize');
        }
      }, 500);
    },

    // Limpiar tokens
    clear() {
      localStorage.removeItem(this.storageKeys.token);
      localStorage.removeItem(this.storageKeys.refreshToken);
      localStorage.removeItem(this.storageKeys.expiresAt);
      console.log('✓ Tokens limpiados');
      this.updatePanel();
    }
  };

  // ==================== INTERCEPTOR DE FETCH ====================
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Interceptar respuestas de auth endpoints
    if (response.ok) {
      const url = args[0];
      const isAuthEndpoint = 
        url.toString().includes('/auth/login') ||
        url.toString().includes('/auth/register') ||
        url.toString().includes('/auth/refresh');

      if (isAuthEndpoint) {
        try {
          const cloned = response.clone();
          const data = await cloned.json();
          
          if (data.data?.tokens?.accessToken) {
            TokenManager.save(
              data.data.tokens.accessToken,
              data.data.tokens.refreshToken,
              data.data.tokens.expiresIn || 3600
            );
            TokenManager.updatePanel();
          }
        } catch (e) {
          // silenciar errores de parsing
        }
      }
    }
    
    return response;
  };

  // ==================== PANEL VISUAL ====================
  TokenManager.createPanel = function() {
    const panel = document.createElement('div');
    panel.id = 'token-manager-panel';
    panel.innerHTML = \`
      <style>
        #token-manager-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          color: #fff;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
          font-size: 13px;
          z-index: 2000;
          max-width: 380px;
          border: 1px solid #444;
        }
        
        #token-manager-panel.hidden { display: none; }
        
        .token-header {
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .token-status {
          padding: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          margin-bottom: 12px;
          font-size: 12px;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }
        
        .status-valid { color: #00cc66; }
        .status-invalid { color: #ff6633; }
        
        .token-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .token-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .token-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .btn-view { background: #0066cc; }
        .btn-clear { background: #cc3300; }
        .btn-refresh { background: #00cc66; }
        
        .token-display {
          background: rgba(0,0,0,0.4);
          padding: 8px;
          border-radius: 4px;
          max-height: 120px;
          overflow-y: auto;
          word-break: break-all;
          font-family: 'Monaco', monospace;
          font-size: 11px;
          display: none;
          margin-top: 8px;
        }
        
        .token-display.show { display: block; }
      </style>
      
      <div class="token-header">🔐 Token Manager</div>
      
      <div class="token-status">
        <div class="status-item">
          <span>Estado:</span>
          <span class="status-value status-invalid">–</span>
        </div>
        <div class="status-item" style="font-size: 11px;">
          <span>Expira:</span>
          <span class="expiry-value">–</span>
        </div>
      </div>
      
      <div class="token-actions">
        <button class="token-btn btn-view" data-action="view">Ver</button>
        <button class="token-btn btn-refresh" data-action="refresh">Refrescar</button>
        <button class="token-btn btn-clear" data-action="clear">Limpiar</button>
      </div>
      
      <div class="token-display"></div>
    \`;
    
    document.body.appendChild(panel);
    
    // Event listeners
    panel.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'view') {
          const token = TokenManager.get();
          const display = panel.querySelector('.token-display');
          if (token) {
            display.textContent = token;
            display.classList.toggle('show');
          } else {
            display.textContent = '(sin token guardado)';
            display.classList.add('show');
          }
        } else if (action === 'clear') {
          TokenManager.clear();
        } else if (action === 'refresh') {
          const refreshToken = localStorage.getItem(TokenManager.storageKeys.refreshToken);
          if (refreshToken) {
            console.log('💡 Llama al endpoint POST /api/v1/auth/refresh para renovar');
          }
        }
      });
    });
    
    this.updatePanel();
  };

  TokenManager.updatePanel = function() {
    const panel = document.getElementById('token-manager-panel');
    if (!panel) return;
    
    const token = this.get();
    const expiresAt = localStorage.getItem(this.storageKeys.expiresAt);
    const isValid = this.isValid();
    
    if (!token) {
      panel.classList.add('hidden');
      return;
    }
    
    panel.classList.remove('hidden');
    
    const statusValue = panel.querySelector('.status-value');
    const expiryValue = panel.querySelector('.expiry-value');
    
    if (isValid) {
      statusValue.textContent = '✓ Válido';
      statusValue.className = 'status-value status-valid';
    } else {
      statusValue.textContent = '✗ Expirado';
      statusValue.className = 'status-value status-invalid';
    }
    
    if (expiresAt) {
      const expDate = new Date(expiresAt).toLocaleString('es-ES');
      expiryValue.textContent = expDate;
    }
  };

  // ==================== INICIALIZACIÓN ====================
  // Esperar a que Swagger UI esté listo
  window.addEventListener('load', () => {
    TokenManager.createPanel();
    
    // Auto-aplicar token si existe
    const token = TokenManager.get();
    if (token && TokenManager.isValid()) {
      TokenManager.applyToSwagger(token);
      console.log('💚 Token válido cargado automáticamente');
    }
    
    // Actualizar panel cada 30 segundos
    setInterval(() => TokenManager.updatePanel(), 30000);
  });

  // Exponer en global para debugging
  window.API_TokenManager = TokenManager;
})();
</script>
`;
}

/**
 * Opciones personalizadas para Swagger UI
 */
export const swaggerCustomization = {
    siteTitle: "Task Manager API",
    css: `.swagger - ui.topbar { background: linear - gradient(135deg, #667eea 0 %, #764ba2 100 %); }
    .swagger - ui.auth - container { background: #f5f5f5; } `,
};
