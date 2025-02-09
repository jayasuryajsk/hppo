import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { type Model } from '@/lib/model';

import { customMiddleware } from './custom-middleware';

export const customModel = (modelName: Model['name']) => {
  return wrapLanguageModel({
    model: google('gemini-2.0-flash-001'),
    middleware: customMiddleware,
  });
};
