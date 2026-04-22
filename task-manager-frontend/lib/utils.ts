import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Insert emoji at cursor position in an input or textarea element
 * @param element The input or textarea element
 * @param emoji The emoji string to insert
 */
export function insertEmojiAtCursor(
  element: HTMLInputElement | HTMLTextAreaElement | null,
  emoji: string
): void {
  if (!element) return;

  const start = element.selectionStart ?? element.value.length;
  const end = element.selectionEnd ?? element.value.length;

  const before = element.value.substring(0, start);
  const after = element.value.substring(end);

  // Set the new value
  const newValue = before + emoji + after;

  // Use native setter to trigger React's onChange
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    element.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, newValue);
  } else {
    element.value = newValue;
  }

  // Dispatch input event so React detects the change
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);

  // Also dispatch change event for good measure
  const changeEvent = new Event('change', { bubbles: true });
  element.dispatchEvent(changeEvent);

  // Set cursor position after the emoji
  const newCursorPos = start + emoji.length;

  // Focus and set selection after a brief delay to ensure the value is updated
  requestAnimationFrame(() => {
    element.focus();
    element.setSelectionRange(newCursorPos, newCursorPos);
  });
}

/**
 * Get the current cursor position from an element
 */
export function getCursorPosition(
  element: HTMLInputElement | HTMLTextAreaElement | null
): number {
  if (!element) return 0;
  return element.selectionStart ?? element.value.length;
}
