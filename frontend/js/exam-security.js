/**
 * Exam Security Module - University Exam Portal
 * Handles anti-cheating measures during exam taking
 */

const ExamSecurity = {
  tabSwitchCount: 0,
  blurCount: 0,
  violations: [],
  isActive: false,
  examId: null,

  /**
   * Initialize security monitoring
   */
  init(examId) {
    this.examId = examId;
    this.tabSwitchCount = 0;
    this.blurCount = 0;
    this.violations = [];
    this.isActive = true;
    
    this.setupVisibilityListener();
    this.setupBlurListener();
    this.setupCopyPasteListener();
    this.setupContextMenuListener();
    this.setupKeyboardListener();
    
    document.body.classList.add('exam-mode');
    
    console.log('Exam security initialized');
  },

  /**
   * Disable security monitoring
   */
  destroy() {
    this.isActive = false;
    document.body.classList.remove('exam-mode');
    
    // Remove event listeners if they exist
    if (this.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (this.handleBlur) {
      window.removeEventListener('blur', this.handleBlur);
    }
    if (this.preventCopyPaste) {
      document.removeEventListener('copy', this.preventCopyPaste);
      document.removeEventListener('paste', this.preventCopyPaste);
      document.removeEventListener('cut', this.preventCopyPaste);
    }
    if (this.preventContextMenu) {
      document.removeEventListener('contextmenu', this.preventContextMenu);
    }
    if (this.handleKeydown) {
      document.removeEventListener('keydown', this.handleKeydown);
    }
    
    console.log('Exam security destroyed');
  },

  /**
   * Log violation
   */
  logViolation(type, details = {}) {
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      examId: this.examId,
      ...details
    };
    
    this.violations.push(violation);
    
    if (CONFIG.SECURITY.LOG_VIOLATIONS) {
      console.warn('Security violation:', violation);
    }
    
    return violation;
  },

  /**
   * Setup visibility change listener (tab switching)
   */
  setupVisibilityListener() {
    this.handleVisibilityChange = () => {
      if (!this.isActive) return;
      
      if (document.hidden) {
        this.tabSwitchCount++;
        this.logViolation('TAB_SWITCH', { count: this.tabSwitchCount });
        
        if (this.tabSwitchCount >= CONFIG.SECURITY.MAX_TAB_SWITCHES) {
          this.showCriticalWarning();
        } else {
          this.showWarning('Tab Switch Detected', 
            `Warning ${this.tabSwitchCount}/${CONFIG.SECURITY.MAX_TAB_SWITCHES}: Please stay on the exam page. Further violations may result in auto-submission.`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },

  /**
   * Setup window blur listener
   */
  setupBlurListener() {
    this.handleBlur = () => {
      if (!this.isActive) return;
      
      this.blurCount++;
      this.logViolation('WINDOW_BLUR', { count: this.blurCount });
      
      if (this.blurCount >= CONFIG.SECURITY.MAX_BLUR_EVENTS) {
        this.showWarning('Focus Lost', 'Please keep this window in focus during the exam.');
      }
    };
    
    window.addEventListener('blur', this.handleBlur);
  },

  /**
   * Prevent copy/paste
   */
  setupCopyPasteListener() {
    this.preventCopyPaste = (e) => {
      if (!this.isActive) return;
      
      // Allow in text inputs for typing answers
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.type === 'paste') {
          // Allow paste in answer fields
          return;
        }
      }
      
      // Allow copy/paste/cut within Monaco editor (code editor)
      const monacoContainer = e.target.closest('.monaco-editor, .code-editor-container, .code-question-wrapper');
      if (monacoContainer) {
        return;
      }
      
      e.preventDefault();
      this.logViolation('COPY_PASTE_ATTEMPT', { action: e.type });
      this.showWarning('Action Blocked', 'Copy/paste is disabled during the exam.');
    };
    
    document.addEventListener('copy', this.preventCopyPaste);
    document.addEventListener('cut', this.preventCopyPaste);
    document.addEventListener('paste', this.preventCopyPaste);
  },

  /**
   * Prevent right-click context menu
   */
  setupContextMenuListener() {
    this.preventContextMenu = (e) => {
      if (!this.isActive) return;
      e.preventDefault();
      this.logViolation('CONTEXT_MENU_ATTEMPT');
    };
    
    document.addEventListener('contextmenu', this.preventContextMenu);
  },

  /**
   * Handle keyboard shortcuts
   */
  setupKeyboardListener() {
    this.handleKeydown = (e) => {
      if (!this.isActive) return;
      
      // Block F12 (dev tools)
      if (e.key === 'F12') {
        e.preventDefault();
        this.logViolation('DEV_TOOLS_ATTEMPT');
        return;
      }
      
      // Block Ctrl+Shift+I (dev tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.logViolation('DEV_TOOLS_ATTEMPT');
        return;
      }
      
      // Block Ctrl+U (view source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        this.logViolation('VIEW_SOURCE_ATTEMPT');
        return;
      }
    };
    
    document.addEventListener('keydown', this.handleKeydown);
  },

  /**
   * Show warning modal
   */
  showWarning(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'security-warning-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" style="color: var(--warning);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; vertical-align: middle;">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            ${title}
          </h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="warning-acknowledge">I Understand</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#warning-acknowledge').onclick = () => {
      overlay.remove();
    };
  },

  /**
   * Show critical warning (may lead to auto-submit)
   */
  showCriticalWarning() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'critical-warning-modal';
    overlay.innerHTML = `
      <div class="modal" style="border: 2px solid var(--error);">
        <div class="modal-header">
          <h3 class="modal-title" style="color: var(--error);">
            ⚠️ Critical Warning
          </h3>
        </div>
        <div class="modal-body">
          <p style="font-size: 1.1em;">You have exceeded the maximum number of tab switches allowed.</p>
          <p class="text-muted mt-4">Your exam activity has been logged. Any further violations may result in automatic submission of your exam.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" id="critical-acknowledge">I Understand - Continue Exam</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#critical-acknowledge').onclick = () => {
      overlay.remove();
    };
  },

  /**
   * Get violation summary
   */
  getViolationSummary() {
    return {
      tabSwitches: this.tabSwitchCount,
      windowBlurs: this.blurCount,
      totalViolations: this.violations.length,
      violations: this.violations
    };
  }
};
