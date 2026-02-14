/**
 * Monaco Editor Configuration for Exam Portal
 */

// Configure Monaco Editor
if (typeof require !== 'undefined') {
  require.config({ 
    paths: { 
      'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
    } 
  });
}

/**
 * Initialize Monaco Editor for a given element
 * @param {HTMLElement} editorElement - The DOM element to host the editor
 * @param {string} language - The programming language for syntax highlighting
 * @param {string} initialValue - Initial value for the editor
 * @returns {Promise} - Promise that resolves to the editor instance
 */
function initializeMonacoEditor(editorElement, language, initialValue = '') {
  return new Promise((resolve, reject) => {
    if (typeof require === 'undefined') {
      reject(new Error('Monaco loader not found'));
      return;
    }

    // Map language aliases to Monaco's language IDs
    const languageMap = {
      'python': 'python',
      'java': 'java',
      'javascript': 'javascript',
      'js': 'javascript',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'typescript': 'typescript',
      'ts': 'typescript',
      'html': 'html',
      'css': 'css',
      'sql': 'sql'
    };
    
    const editorLanguage = languageMap[language.toLowerCase()] || language;

    try {
      require(['vs/editor/editor.main'], (monaco) => {
        if (!editorElement) {
          reject(new Error('Editor element not found'));
          return;
        }

        // Create the editor instance
        const editor = monaco.editor.create(editorElement, {
          value: initialValue,
          language: editorLanguage,
          theme: 'vs-dark',
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          autoIndent: 'full',
          formatOnType: true,
          formatOnPaste: true,
          tabSize: 4,
          insertSpaces: true,
          fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace"
        });

        resolve(editor);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Dispose of a Monaco Editor instance to free up resources
 * @param {Object} editorInstance - The editor instance to dispose
 */
function disposeMonacoEditor(editorInstance) {
  if (editorInstance && typeof editorInstance.dispose === 'function') {
    editorInstance.dispose();
    return true;
  }
  return false;
}

/**
 * Get all Monaco editor elements on the page
 * @returns {NodeList} - List of elements that might contain Monaco editors
 */
function getMonacoEditorElements() {
  return document.querySelectorAll('[id^="monaco-editor-"]');
}