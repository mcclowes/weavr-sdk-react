// Storybook configuration - reads from environment variables
// Copy .env.example to .env and set your Weavr UI key

declare global {
  interface ImportMeta {
    env: {
      STORYBOOK_WEAVR_UI_KEY?: string
      STORYBOOK_WEAVR_ENVIRONMENT?: string
      STORYBOOK_WEAVR_PROGRAMME_KEY?: string
      STORYBOOK_WEAVR_CORPORATE_ID?: string
    }
  }
}

export const weavrConfig = {
  uiKey: import.meta.env.STORYBOOK_WEAVR_UI_KEY || 'demo-ui-key',
  environment: (import.meta.env.STORYBOOK_WEAVR_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  programmeKey: import.meta.env.STORYBOOK_WEAVR_PROGRAMME_KEY || '',
  corporateId: import.meta.env.STORYBOOK_WEAVR_CORPORATE_ID || '',
}
