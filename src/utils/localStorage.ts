// LocalStorage utilities for draft management
import type { Draft } from '../types';

const DRAFTS_KEY = 'formC_drafts';

export const localStorageService = {
  // Get all drafts
  getDrafts(): Draft[] {
    try {
      const stored = localStorage.getItem(DRAFTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading drafts from localStorage:', error);
      return [];
    }
  },

  // Save draft
  saveDraft(draft: Draft): void {
    try {
      const drafts = this.getDrafts();
      const existingIndex = drafts.findIndex(d => d.id === draft.id);
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft;
      } else {
        drafts.push(draft);
      }
      
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
      throw new Error('Failed to save draft');
    }
  },

  // Delete draft
  deleteDraft(draftId: string): void {
    try {
      const drafts = this.getDrafts();
      const filtered = drafts.filter(d => d.id !== draftId);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting draft from localStorage:', error);
      throw new Error('Failed to delete draft');
    }
  },

  // Get single draft
  getDraft(draftId: string): Draft | null {
    const drafts = this.getDrafts();
    return drafts.find(d => d.id === draftId) || null;
  },

  // Clear all drafts
  clearAllDrafts(): void {
    try {
      localStorage.removeItem(DRAFTS_KEY);
    } catch (error) {
      console.error('Error clearing drafts from localStorage:', error);
    }
  },

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
};
