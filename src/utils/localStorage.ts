// LocalStorage utilities for draft management
import type { Draft } from '../types';

const DRAFTS_KEY = 'formC_drafts';
const AUTOSAVE_KEY = 'formC_autosave';

export const draftService = {
  // Get all saved drafts (explicitly saved by user)
  getDrafts(): Draft[] {
    try {
      const stored = localStorage.getItem(DRAFTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading drafts from localStorage:', error);
      return [];
    }
  },

  // Save draft (explicit save by user - goes to drafts list)
  saveDraft(draftData: Partial<Draft>): Draft {
    try {
      const drafts = this.getDrafts();
      
      // If draft has an ID, update it; otherwise create new
      let draft: Draft;
      if (draftData.id) {
        const existingIndex = drafts.findIndex(d => d.id === draftData.id);
        draft = {
          ...draftData,
          savedAt: new Date().toISOString(),
          status: draftData.status || 'incomplete',
        } as Draft;
        
        if (existingIndex >= 0) {
          drafts[existingIndex] = draft;
        } else {
          drafts.push(draft);
        }
      } else {
        draft = {
          ...draftData,
          id: `DRAFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          savedAt: new Date().toISOString(),
          status: 'incomplete',
        } as Draft;
        drafts.push(draft);
      }
      
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      return draft;
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

  // Autosave current form state (transient, not in drafts list)
  saveAutosave(formData: any, photoPreview?: string, photoSize?: number): void {
    try {
      const autosave = {
        formData,
        photoPreview,
        photoSize,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(autosave));
    } catch (error) {
      console.error('Error saving autosave:', error);
    }
  },

  // Get autosave data
  getAutosave(): { formData: any; photoPreview?: string; photoSize?: number; savedAt: string } | null {
    try {
      const stored = localStorage.getItem(AUTOSAVE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading autosave:', error);
      return null;
    }
  },

  // Clear autosave
  clearAutosave(): void {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch (error) {
      console.error('Error clearing autosave:', error);
    }
  },

  // Update draft status (e.g., from incomplete to pending_approval)
  updateDraftStatus(draftId: string, status: 'incomplete' | 'pending_approval'): void {
    try {
      const drafts = this.getDrafts();
      const index = drafts.findIndex(d => d.id === draftId);
      if (index >= 0) {
        drafts[index].status = status;
        drafts[index].savedAt = new Date().toISOString();
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      }
    } catch (error) {
      console.error('Error updating draft status:', error);
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

// Legacy compatibility
export const localStorageService = draftService;
