import { fetchGroq, fetchUnsplashImage } from '@/utils/ai';

// Mock global fetch
global.fetch = jest.fn();

describe('AI Utilities', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.GROQ_API_KEY = 'test_groq_key';
    process.env.UNSPLASH_ACCESS_KEY = 'test_unsplash_key';
  });

  describe('fetchGroq', () => {
    it('throws if API key is not set', async () => {
      delete process.env.GROQ_API_KEY;
      await expect(fetchGroq('sys', 'user')).rejects.toThrow('GROQ_API_KEY not set');
    });

    it('returns parsed JSON successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[{"id": 1}]' } }]
        })
      });

      const result = await fetchGroq('sys', 'user');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('handles non-ok responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad Request' } })
      });

      await expect(fetchGroq('sys', 'user')).rejects.toThrow('Groq API error 400: Bad Request');
    });
  });

  describe('fetchUnsplashImage', () => {
    it('returns fallback if no API key', async () => {
      delete process.env.UNSPLASH_ACCESS_KEY;
      const res = await fetchUnsplashImage('test');
      expect(res.alt).toBe('test');
      expect(res.url).toContain('placehold.co');
    });

    it('fetches image successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          urls: { regular: 'https://example.com/image.jpg' },
          alt_description: 'An example image'
        })
      });

      const res = await fetchUnsplashImage('test');
      expect(res.url).toBe('https://example.com/image.jpg');
      expect(res.alt).toBe('An example image');
    });
  });
});
