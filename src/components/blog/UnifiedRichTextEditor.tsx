import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, Heading4, Link2, Undo, Redo, Table } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface UnifiedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  isActive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  onClick,
  title,
  isActive = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-600'
          : 'hover:bg-neutral-200 text-neutral-600'
      }`}
    >
      {icon}
    </button>
  );
};

const UnifiedRichTextEditor: React.FC<UnifiedRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isFormattingRef = useRef(false);
  const lastValueRef = useRef<string>(value);
  const isInternalChangeRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const historyStack = useRef<string[]>([value]);
  const historyIndex = useRef<number>(0);
  const isUndoRedoAction = useRef(false);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false
  });

  const cleanWordPasteHTML = (html: string): string => {
    // LAYER 0: CRITICAL - Convert Word lists to HTML lists BEFORE removing styles
    const convertWordListsToHTML = (htmlString: string): string => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;

      // Find all paragraphs with mso-list style (Word list items)
      const allParagraphs = Array.from(tempDiv.querySelectorAll('p, div'));
      const listGroups: { [key: string]: Element[] } = {};

      allParagraphs.forEach(p => {
        const style = p.getAttribute('style') || '';

        // Check if this paragraph is a Word list item
        if (style.includes('mso-list')) {
          // Extract list instance ID and level to properly group related list items
          // Word format: mso-list:l0 level1, mso-list:l1 level1, etc.
          // The 'l0', 'l1' identifies different list instances at the same level
          const listMatch = style.match(/mso-list:\s*l(\d+)\s+level(\d+)/i);
          const listId = listMatch ? listMatch[1] : '0';
          const level = listMatch ? listMatch[2] : '1';

          // Determine if bullet or numbered list
          const isBullet = style.includes('mso-list:') && (
            p.textContent?.includes('·') ||
            p.textContent?.includes('•') ||
            style.includes('bullet')
          );

          const listType = isBullet ? 'ul' : 'ol';
          const groupKey = `${listType}-${listId}-${level}`;

          if (!listGroups[groupKey]) {
            listGroups[groupKey] = [];
          }
          listGroups[groupKey].push(p);
        }
      });

      // Convert grouped paragraphs to list elements
      Object.keys(listGroups).forEach(groupKey => {
        const [listType] = groupKey.split('-');
        const items = listGroups[groupKey];

        if (items.length > 0) {
          // Create the list element
          const listElement = document.createElement(listType);

          // Convert each paragraph to a list item
          items.forEach(p => {
            const li = document.createElement('li');

            // Remove list marker characters from content
            let textContent = p.innerHTML;
            // Remove common Word list markers: ·, •, o, and numbers with dots/parens
            textContent = textContent.replace(/^(<[^>]*>)*[·•o]\s*/i, '$1');
            textContent = textContent.replace(/^(<[^>]*>)*\d+[\.)]\s*/i, '$1');
            textContent = textContent.replace(/^(<[^>]*>)*\(?[a-z][\.)]\s*/i, '$1');

            // Only remove excessive leading whitespace (2+ spaces), preserve single spaces
            textContent = textContent.replace(/^(<[^>]*>)*[\s\u00A0\u2002-\u200B]{2,}/g, '$1 ');
            // Collapse only excessive whitespace after tags, keep a single space
            textContent = textContent.replace(/>[\s\u00A0\u2002-\u200B]{2,}/g, '> ');

            li.innerHTML = textContent;
            listElement.appendChild(li);
          });

          // Replace the first paragraph with the list
          const firstItem = items[0];
          firstItem.parentNode?.insertBefore(listElement, firstItem);

          // Remove all the original paragraphs
          items.forEach(item => item.remove());
        }
      });

      return tempDiv.innerHTML;
    };

    // Apply Word list conversion FIRST
    html = convertWordListsToHTML(html);

    // LAYER 1: Remove Word-specific metadata and comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/<!\[if[\s\S]*?<!\[endif\]>/g, '');
    html = html.replace(/<\\?\?xml[^>]*>/g, '');
    html = html.replace(/<\/?o:p[^>]*>/g, '');
    html = html.replace(/<\/?w:[^>]*>/g, '');
    html = html.replace(/<\/?m:[^>]*>/g, '');
    html = html.replace(/<\/?v:[^>]*>/g, '');

    // LAYER 2: Remove Word-specific class names
    html = html.replace(/class="Mso[^"]*"/gi, '');
    html = html.replace(/class="Word[^"]*"/gi, '');

    // LAYER 3: Remove style tags and font tags entirely
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<\/?font[^>]*>/gi, '');

    // LAYER 4: Advanced DOM-based cleaning
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove all span tags but preserve their content - IMPROVED for lists
    const unwrapSpans = (element: Element) => {
      const spans = Array.from(element.querySelectorAll('span'));
      spans.forEach(span => {
        const parent = span.parentNode;
        if (!parent) return;

        // Check if span contains only list marker characters that should be removed
        const spanText = span.textContent || '';
        const isListMarker = /^[·•o\-\*]\s*$/.test(spanText.trim()) ||
                            /^\d+[\.)]\s*$/.test(spanText.trim()) ||
                            /^\(?[a-z][\.)]\s*$/.test(spanText.trim());

        if (isListMarker && parent.nodeName === 'LI') {
          // Remove list marker spans inside list items
          span.remove();
          return;
        }

        // For all other spans, unwrap them
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        span.remove();
      });
    };

    unwrapSpans(tempDiv);

    // Remove all inline styles and Word-specific attributes
    const removeInlineStyles = (element: Element) => {
      const allElements = Array.from(element.querySelectorAll('*'));
      allElements.forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
        el.removeAttribute('lang');
        el.removeAttribute('dir');

        // Remove data attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            el.removeAttribute(attr.name);
          }
        });
      });
    };

    removeInlineStyles(tempDiv);

    // Special: Ensure headings only contain text or basic formatting
    const cleanHeadings = (element: Element) => {
      const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      headings.forEach(heading => {
        const textContent = heading.textContent || '';
        const allowedInline = heading.querySelectorAll('strong, em, i, b, u');
        const allChildren = heading.querySelectorAll('*');

        // If there are non-allowed elements, flatten to text only
        if (allChildren.length !== allowedInline.length) {
          heading.innerHTML = textContent;
        }
      });
    };

    cleanHeadings(tempDiv);

    // CRITICAL: Fix orphaned list items and validate list structure - IMPROVED
    const fixListStructure = (element: Element) => {
      // Find all list items
      const listItems = Array.from(element.querySelectorAll('li'));

      listItems.forEach(li => {
        const parent = li.parentElement;

        // If list item is not inside ul or ol, wrap it
        if (parent && parent.tagName !== 'UL' && parent.tagName !== 'OL') {
          // Try to determine if it should be ul or ol based on siblings or content
          const ul = document.createElement('ul');
          parent.insertBefore(ul, li);
          ul.appendChild(li);

          // Check if there are adjacent orphaned list items that should be grouped
          let nextSibling = ul.nextSibling;
          while (nextSibling && nextSibling.nodeName === 'LI') {
            const nextLi = nextSibling;
            nextSibling = nextSibling.nextSibling;
            ul.appendChild(nextLi);
          }
        }
      });

      // Merge consecutive lists of the same type
      const lists = Array.from(element.querySelectorAll('ul, ol'));
      lists.forEach(list => {
        const nextSibling = list.nextElementSibling;
        if (nextSibling && nextSibling.tagName === list.tagName) {
          // Merge lists
          while (nextSibling.firstChild) {
            list.appendChild(nextSibling.firstChild);
          }
          nextSibling.remove();
        }
      });

      // Remove truly empty lists (no children at all)
      const allLists = Array.from(element.querySelectorAll('ul, ol'));
      allLists.forEach(list => {
        if (list.children.length === 0) {
          list.remove();
        }
      });

      // Ensure list items contain content
      const allListItems = Array.from(element.querySelectorAll('li'));
      allListItems.forEach(li => {
        if (!li.textContent?.trim() && li.children.length === 0) {
          li.textContent = '\u200B'; // Zero-width space
        }

        // Remove empty list markers and leading whitespace that might remain
        const firstChild = li.firstChild;
        if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
          const text = firstChild.textContent || '';
          // Remove list markers
          let cleaned = text.replace(/^[·•o\-\*]\s*/, '').replace(/^\d+[\.)]\s*/, '');
          // Only remove excessive leading whitespace (2+ spaces), preserve single spaces
          cleaned = cleaned.replace(/^[\s\u00A0\u2002-\u200B]{2,}/, ' ');
          if (cleaned !== text) {
            firstChild.textContent = cleaned;
          }
        }
      });
    };

    fixListStructure(tempDiv);

    return tempDiv.innerHTML;
  };

  const sanitizeHTML = (html: string): string => {
    const config = {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'p',
        'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li', 'br', 'a',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['href', 'contenteditable'],
      KEEP_CONTENT: true,
      SAFE_FOR_TEMPLATES: true,
      ALLOW_DATA_ATTR: false,
      FORBID_ATTR: ['style', 'id', 'class', 'lang', 'dir', 'face', 'size', 'color'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'link', 'meta', 'font', 'span']
    };

    try {
      let sanitized = DOMPurify.sanitize(html, config);

      // Post-sanitization cleanup
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitized;

      // Fix invalid HTML structure: headings inside anchor tags (should be anchor inside heading)
      // Pattern: <a><h2>Title</h2></a> → <h2><a>Title</a></h2>
      const invalidStructures = tempDiv.querySelectorAll('a > h1, a > h2, a > h3, a > h4, a > h5, a > h6');
      invalidStructures.forEach(heading => {
        const anchor = heading.parentElement;
        if (anchor?.tagName === 'A') {
          const href = anchor.getAttribute('href');

          // Move heading out of anchor
          anchor.parentNode?.insertBefore(heading, anchor);

          // If anchor had a valid href, create new anchor inside heading
          if (href && href !== '#' && href !== '') {
            const newAnchor = document.createElement('a');
            newAnchor.setAttribute('href', href);
            newAnchor.textContent = heading.textContent || '';
            heading.textContent = '';
            heading.appendChild(newAnchor);
          }

          // Remove now-empty anchor tag
          anchor.remove();
        }
      });

      // Final pass to ensure no lingering styles or unwanted attributes
      const finalCleanup = (element: Element) => {
        const allElements = Array.from(element.querySelectorAll('*'));
        allElements.forEach(el => {
          // Remove any remaining style attributes
          el.removeAttribute('style');
          el.removeAttribute('class');
          el.removeAttribute('id');

          // Clean up empty elements (except br, li, ul, ol)
          // IMPORTANT: Preserve list structure even if items appear empty temporarily
          const isListElement = ['BR', 'LI', 'UL', 'OL'].includes(el.tagName);
          const isEmpty = !el.textContent?.trim() && el.children.length === 0;

          if (!isListElement && isEmpty) {
            el.remove();
          }
        });
      };

      finalCleanup(tempDiv);

      sanitized = tempDiv.innerHTML;
      return sanitized;
    } catch (error) {
      console.error('Sanitization error:', error);
      const textOnly = html.replace(/<[^>]*>/g, '');
      return textOnly;
    }
  };

  const saveCursorPosition = (): { start: number; end: number } | null => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !editorRef.current) {
        return null;
      }

      const range = selection.getRangeAt(0);

      if (!editorRef.current.contains(range.startContainer)) {
        return null;
      }

      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;

      return {
        start,
        end: start + range.toString().length
      };
    } catch (error) {
      console.warn('Failed to save cursor position:', error);
      return null;
    }
  };

  const restoreCursorPosition = (position: { start: number; end: number } | null) => {
    if (!position || !editorRef.current) {
      return;
    }

    try {
      const selection = window.getSelection();
      if (!selection) {
        return;
      }

      let charIndex = 0;
      const range = document.createRange();
      range.setStart(editorRef.current, 0);
      range.collapse(true);

      const nodeStack: Node[] = [editorRef.current];
      let node: Node | undefined;
      let foundStart = false;
      let stop = false;

      while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharIndex = charIndex + (node.textContent?.length || 0);
          if (!foundStart && position.start >= charIndex && position.start <= nextCharIndex) {
            range.setStart(node, position.start - charIndex);
            foundStart = true;
          }
          if (foundStart && position.end >= charIndex && position.end <= nextCharIndex) {
            range.setEnd(node, position.end - charIndex);
            stop = true;
          }
          charIndex = nextCharIndex;
        } else {
          let i = node.childNodes.length;
          while (i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }

      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.warn('Failed to restore cursor position, placing at end:', error);
      try {
        const selection = window.getSelection();
        if (selection && editorRef.current) {
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (fallbackError) {
        console.warn('Fallback cursor positioning also failed:', fallbackError);
      }
    }
  };

  const updateFormattingState = useCallback(() => {
    // Prevent updates during programmatic changes to avoid race conditions
    if (isFormattingRef.current || isUndoRedoAction.current) {
      return;
    }

    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      let node: Node | null = selection.anchorNode;
      const headingStates = {
        h1: false,
        h2: false,
        h3: false,
        h4: false
      };

      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName;
          if (tagName === 'H1') {
            headingStates.h1 = true;
            break;
          } else if (tagName === 'H2') {
            headingStates.h2 = true;
            break;
          } else if (tagName === 'H3') {
            headingStates.h3 = true;
            break;
          } else if (tagName === 'H4') {
            headingStates.h4 = true;
            break;
          }
        }
        node = node.parentNode;
      }

      const newFormats = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        ...headingStates
      };

      setActiveFormats(newFormats);
    } catch (error) {
      console.warn('Failed to update formatting state:', error);
    }
  }, []);

  const saveToHistory = (content: string) => {
    if (isUndoRedoAction.current) {
      return;
    }

    if (historyStack.current[historyIndex.current] !== content) {
      historyStack.current = historyStack.current.slice(0, historyIndex.current + 1);
      historyStack.current.push(content);

      if (historyStack.current.length > 100) {
        historyStack.current = historyStack.current.slice(-100);
      }

      historyIndex.current = historyStack.current.length - 1;
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current && !isUndoRedoAction.current) {
      const newContent = editorRef.current.innerHTML;
      lastValueRef.current = newContent;
      isInternalChangeRef.current = true;

      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }

      changeTimeoutRef.current = setTimeout(() => {
        saveToHistory(newContent);
      }, 300);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onChange(newContent);
        setTimeout(() => {
          isInternalChangeRef.current = false;
        }, 50);
      }, 150);

      updateFormattingState();
    }
  };

  const ensureSelection = (): boolean => {
    if (!editorRef.current) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    if (selection.rangeCount === 0 || !editorRef.current.contains(selection.anchorNode)) {
      const range = document.createRange();

      if (editorRef.current.childNodes.length === 0) {
        const textNode = document.createTextNode('\u200B');
        editorRef.current.appendChild(textNode);
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);
      } else {
        const firstNode = editorRef.current.firstChild!;
        if (firstNode.nodeType === Node.TEXT_NODE) {
          range.setStart(firstNode, 0);
          range.setEnd(firstNode, 0);
        } else {
          range.selectNodeContents(firstNode);
          range.collapse(false);
        }
      }

      selection.removeAllRanges();
      selection.addRange(range);
    }

    return true;
  };

  const performUndo = () => {
    if (historyIndex.current > 0) {
      isUndoRedoAction.current = true;
      historyIndex.current -= 1;
      const previousContent = historyStack.current[historyIndex.current];

      if (editorRef.current) {
        const cursorPosition = saveCursorPosition();
        editorRef.current.innerHTML = previousContent;
        lastValueRef.current = previousContent;
        onChange(previousContent);

        requestAnimationFrame(() => {
          restoreCursorPosition(cursorPosition);
          updateFormattingState();
          isUndoRedoAction.current = false;
        });
      }
    }
  };

  const performRedo = () => {
    if (historyIndex.current < historyStack.current.length - 1) {
      isUndoRedoAction.current = true;
      historyIndex.current += 1;
      const nextContent = historyStack.current[historyIndex.current];

      if (editorRef.current) {
        const cursorPosition = saveCursorPosition();
        editorRef.current.innerHTML = nextContent;
        lastValueRef.current = nextContent;
        onChange(nextContent);

        requestAnimationFrame(() => {
          restoreCursorPosition(cursorPosition);
          updateFormattingState();
          isUndoRedoAction.current = false;
        });
      }
    }
  };

  const executeCommand = (command: string, value?: string) => {
    if (!editorRef.current) {
      return;
    }

    if (command === 'undo') {
      performUndo();
      return;
    }

    if (command === 'redo') {
      performRedo();
      return;
    }

    try {
      isFormattingRef.current = true;
      editorRef.current.focus();

      if (!ensureSelection()) {
        console.warn('Failed to ensure selection for command:', command);
        return;
      }

      const success = document.execCommand(command, false, value);

      if (!success) {
        console.warn('Command execution failed:', command);
      }

      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        onChange(newContent);
        saveToHistory(newContent);
      }

      requestAnimationFrame(() => {
        updateFormattingState();
        if (editorRef.current) {
          editorRef.current.focus();
        }
        isFormattingRef.current = false;
      });
    } catch (error) {
      console.error('Error executing command:', command, error);
      isFormattingRef.current = false;
    }
  };

  const formatHeading = (level: number) => {
    executeCommand('formatBlock', `h${level}`);
  };

  const toggleHeading = (level: number) => {
    const headingKey = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';

    if (activeFormats[headingKey]) {
      executeCommand('formatBlock', 'p');
    } else {
      formatHeading(level);
    }
  };

  const insertLink = () => {
    if (!editorRef.current) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      alert('Please select text first to create a link');
      return;
    }

    const savedSelection = saveCursorPosition();

    const url = prompt('Enter URL:');
    if (!url) {
      editorRef.current.focus();
      if (savedSelection) {
        restoreCursorPosition(savedSelection);
      }
      return;
    }

    editorRef.current.focus();
    if (savedSelection) {
      restoreCursorPosition(savedSelection);
    }
    executeCommand('createLink', url);
  };

  const insertTable = () => {
    if (!editorRef.current) {
      return;
    }

    const rows = prompt('Number of rows (2-10):', '3');
    if (!rows) return;

    const cols = prompt('Number of columns (2-10):', '3');
    if (!cols) return;

    const numRows = Math.min(Math.max(2, parseInt(rows) || 3), 10);
    const numCols = Math.min(Math.max(2, parseInt(cols) || 3), 10);

    let tableHTML = '<table class="editor-table"><thead><tr>';
    for (let c = 0; c < numCols; c++) {
      tableHTML += '<th contenteditable="true">Header ' + (c + 1) + '</th>';
    }
    tableHTML += '</tr></thead><tbody>';
    for (let r = 0; r < numRows - 1; r++) {
      tableHTML += '<tr>';
      for (let c = 0; c < numCols; c++) {
        tableHTML += '<td contenteditable="true">Cell</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table><p><br></p>';

    editorRef.current.focus();
    document.execCommand('insertHTML', false, tableHTML);

    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      saveToHistory(newContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      performUndo();
    } else if (ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      performRedo();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    try {
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');

      let contentToInsert = '';

      if (html) {
        // First pass: aggressive Word cleanup
        let cleanedHTML = cleanWordPasteHTML(html);

        // Second pass: DOMPurify sanitization
        contentToInsert = sanitizeHTML(cleanedHTML);
      } else if (text) {
        contentToInsert = text.replace(/\n/g, '<br>');
      }

      if (contentToInsert) {
        document.execCommand('insertHTML', false, contentToInsert);

        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          lastValueRef.current = newContent;
          saveToHistory(newContent);
          onChange(newContent);
        }
      }
    } catch (error) {
      console.error('Error handling paste:', error);
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        document.execCommand('insertText', false, text);
      }
    }
  };

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (!isInitializedRef.current) {
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
      isInitializedRef.current = true;

      if (historyStack.current.length === 0) {
        historyStack.current = [value];
        historyIndex.current = 0;
      }
      return;
    }

    if (isFormattingRef.current || isUndoRedoAction.current) {
      return;
    }

    if (isInternalChangeRef.current) {
      return;
    }

    const currentContent = editorRef.current.innerHTML;
    if (value !== lastValueRef.current && value !== currentContent) {
      const cursorPosition = saveCursorPosition();
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;

      if (historyStack.current.length === 0 || historyStack.current[historyIndex.current] !== value) {
        historyStack.current = [value];
        historyIndex.current = 0;
      }

      requestAnimationFrame(() => {
        restoreCursorPosition(cursorPosition);
      });
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const ToolbarSeparator = () => (
    <div className="w-px h-6 bg-neutral-300 mx-1"></div>
  );

  return (
    <div className={`border border-neutral-200 rounded-2xl overflow-hidden bg-white ${className}`}>
      <div className="border-b border-neutral-200 p-3 bg-neutral-50">
        <div className="flex flex-wrap gap-1 items-center">
          <ToolbarButton
            icon={
              <div className="flex items-center gap-1">
                <Heading1 className="w-4 h-4" />
              </div>
            }
            onClick={() => toggleHeading(1)}
            title="Heading 1"
            isActive={activeFormats.h1}
          />
          <ToolbarButton
            icon={
              <div className="flex items-center gap-1">
                <Heading2 className="w-4 h-4" />
              </div>
            }
            onClick={() => toggleHeading(2)}
            title="Heading 2"
            isActive={activeFormats.h2}
          />
          <ToolbarButton
            icon={
              <div className="flex items-center gap-1">
                <Heading3 className="w-4 h-4" />
              </div>
            }
            onClick={() => toggleHeading(3)}
            title="Heading 3"
            isActive={activeFormats.h3}
          />
          <ToolbarButton
            icon={
              <div className="flex items-center gap-1">
                <Heading4 className="w-4 h-4" />
              </div>
            }
            onClick={() => toggleHeading(4)}
            title="Heading 4"
            isActive={activeFormats.h4}
          />

          <ToolbarSeparator />

          <ToolbarButton
            icon={<Bold className="w-4 h-4" />}
            onClick={() => executeCommand('bold')}
            title="Bold"
            isActive={activeFormats.bold}
          />
          <ToolbarButton
            icon={<Italic className="w-4 h-4" />}
            onClick={() => executeCommand('italic')}
            title="Italic"
            isActive={activeFormats.italic}
          />
          <ToolbarButton
            icon={<Underline className="w-4 h-4" />}
            onClick={() => executeCommand('underline')}
            title="Underline"
            isActive={activeFormats.underline}
          />

          <ToolbarSeparator />

          <ToolbarButton
            icon={<List className="w-4 h-4" />}
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List"
          />
          <ToolbarButton
            icon={<ListOrdered className="w-4 h-4" />}
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
          />

          <ToolbarSeparator />

          <ToolbarButton
            icon={<Link2 className="w-4 h-4" />}
            onClick={insertLink}
            title="Insert Link"
          />
          <ToolbarButton
            icon={<Table className="w-4 h-4" />}
            onClick={insertTable}
            title="Insert Table"
          />

          <ToolbarSeparator />

          <ToolbarButton
            icon={<Undo className="w-4 h-4" />}
            onClick={() => executeCommand('undo')}
            title="Undo"
          />
          <ToolbarButton
            icon={<Redo className="w-4 h-4" />}
            onClick={() => executeCommand('redo')}
            title="Redo"
          />
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleEditorChange}
        onBlur={handleEditorChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onClick={updateFormattingState}
        onMouseUp={updateFormattingState}
        onKeyUp={updateFormattingState}
        className="editor-content p-6 min-h-[400px] focus:outline-none max-w-none"
        data-placeholder={placeholder}
        style={{
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default UnifiedRichTextEditor;
