import { GET } from './route';

describe('RSS Feed Route', () => {
  beforeAll(() => {
    // Mock fetch for the test environment
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return RSS feed with correct Content-Type', async () => {
    // Mock API response
    const mockJobs = Array.from({ length: 100 }, (_, i) => ({
      _id: `job-${i}`,
      originalTitle: `Test Job ${i}`,
      seo: {
        metaTitle: `Test Job ${i} - Remote`,
        metaDescription: `Description for job ${i}`,
        slug: `test-job-${i}`,
      },
      sourceLabel: 'Test Company',
      category: 'Engineering',
      country: 'US',
      publishedAt: new Date('2026-07-09T12:00:00Z').toISOString(),
    }));

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockJobs }),
    });

    const response = await GET();

    // Check Content-Type header
    expect(response.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8');
    
    // Check Cache-Control header
    expect(response.headers.get('Cache-Control')).toBe('s-maxage=3600, stale-while-revalidate');
    
    // Check response status
    expect(response.status).toBe(200);
  });

  it('should fetch 100 jobs from the API', async () => {
    const mockJobs = Array.from({ length: 100 }, (_, i) => ({
      _id: `job-${i}`,
      originalTitle: `Test Job ${i}`,
      seo: { slug: `test-job-${i}` },
      sourceLabel: 'Test Company',
      category: 'Engineering',
      publishedAt: new Date().toISOString(),
    }));

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockJobs }),
    });

    await GET();

    // Verify API was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=1&limit=100'),
      expect.objectContaining({
        next: { revalidate: 3600 }
      })
    );
  });

  it('should generate valid RSS 2.0 XML structure', async () => {
    const mockJobs = [{
      _id: 'job-1',
      originalTitle: 'Senior Engineer',
      seo: {
        metaTitle: 'Senior Engineer - Remote',
        metaDescription: 'Great opportunity for engineers',
        slug: 'senior-engineer-remote',
      },
      sourceLabel: 'Tech Corp',
      category: 'Engineering',
      country: 'US',
      publishedAt: '2026-07-09T12:00:00Z',
    }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockJobs }),
    });

    const response = await GET();
    const rssText = await response.text();

    // Validate RSS structure
    expect(rssText).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
    expect(rssText).toContain('<rss version="2.0"');
    expect(rssText).toContain('<channel>');
    expect(rssText).toContain('<title>RemoteJobDesk - Latest Remote Jobs</title>');
    expect(rssText).toContain('<item>');
    expect(rssText).toContain('</item>');
    expect(rssText).toContain('</channel>');
    expect(rssText).toContain('</rss>');
  });

  it('should include required RSS item fields', async () => {
    const mockJobs = [{
      _id: 'job-1',
      originalTitle: 'Test Job',
      seo: {
        metaTitle: 'Test Job Title',
        metaDescription: 'Test description',
        slug: 'test-job-slug',
      },
      sourceLabel: 'Test Company',
      category: 'Marketing',
      country: 'UK',
      publishedAt: '2026-07-09T12:00:00Z',
    }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockJobs }),
    });

    const response = await GET();
    const rssText = await response.text();

    // Verify required fields
    expect(rssText).toContain('<title>');
    expect(rssText).toContain('<link>');
    expect(rssText).toContain('<guid');
    expect(rssText).toContain('<pubDate>');
    expect(rssText).toContain('<description>');
    expect(rssText).toContain('<category>');
  });

  it('should escape XML special characters', async () => {
    const mockJobs = [{
      _id: 'job-1',
      originalTitle: 'Job with <special> & "characters"',
      seo: {
        metaTitle: 'Job with <special> & "characters"',
        metaDescription: 'Description with <tags> & ampersands',
        slug: 'test-job',
      },
      sourceLabel: 'Company & Co.',
      category: 'Sales',
      publishedAt: '2026-07-09T12:00:00Z',
    }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockJobs }),
    });

    const response = await GET();
    const rssText = await response.text();

    // Check that special characters are escaped
    expect(rssText).toContain('&lt;');
    expect(rssText).toContain('&gt;');
    expect(rssText).toContain('&amp;');
  });

  it('should return 500 error when API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const response = await GET();

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe('Error generating RSS feed');
  });

  it('should handle empty job list', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const response = await GET();
    const rssText = await response.text();

    // Should still return valid RSS with no items
    expect(response.status).toBe(200);
    expect(rssText).toContain('<channel>');
    expect(rssText).toContain('</channel>');
    expect(rssText).not.toContain('<item>');
  });
});
