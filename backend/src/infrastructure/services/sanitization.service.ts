/**
 * Infrastructure Layer - Sanitization Service
 * Protects against XSS attacks by sanitizing user input
 */

import { Injectable } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SanitizationService {
  /**
   * Sanitize HTML/XSS from string input
   * Removes all HTML tags and potentially dangerous content
   */
  sanitizeString(input: string): string {
    if (!input) return input;

    // Remove all HTML tags and scripts
    const cleaned = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
    });

    // Trim whitespace
    return cleaned.trim();
  }

  /**
   * Normalize email address
   * Converts to lowercase and trims whitespace
   */
  normalizeEmail(email: string): string {
    if (!email) return email;
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = this.sanitizeString(value) as T[keyof T];
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key as keyof T] = this.sanitizeObject(value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = value;
      }
    }

    return sanitized;
  }
}
