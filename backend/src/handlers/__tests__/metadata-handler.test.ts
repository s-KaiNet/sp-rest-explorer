import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InvocationContext } from '@azure/functions';
import { handleMetadataGeneration } from '../metadata-handler.js';

// Mock dependencies
vi.mock('../../auth.js', () => ({ getToken: vi.fn() }));
vi.mock('../../pipeline/index.js', () => ({ runPipeline: vi.fn() }));
vi.mock('../../upload/blob-uploader.js', () => ({ uploadBlobs: vi.fn() }));

// Import mocked modules to configure per-test behavior
import { getToken } from '../../auth.js';
import { runPipeline } from '../../pipeline/index.js';
import { uploadBlobs } from '../../upload/blob-uploader.js';

const mockedGetToken = vi.mocked(getToken);
const mockedRunPipeline = vi.mocked(runPipeline);
const mockedUploadBlobs = vi.mocked(uploadBlobs);

function createMockContext(retryContext?: { retryCount: number; maxRetryCount: number }): InvocationContext {
  return {
    log: vi.fn(),
    error: vi.fn(),
    retryContext: retryContext as any,
  } as unknown as InvocationContext;
}

const MOCK_PIPELINE_RESULT = {
  xml: '<xml/>',
  json: '{}',
  compressedJson: 'compressed',
};

describe('handleMetadataGeneration', () => {
  let savedSpUrl: string | undefined;

  beforeEach(() => {
    savedSpUrl = process.env.SP_URL;
    process.env.SP_URL = 'https://test.sharepoint.com';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (savedSpUrl !== undefined) {
      process.env.SP_URL = savedSpUrl;
    } else {
      delete process.env.SP_URL;
    }
  });

  it('calls auth, pipeline, upload in sequence and returns ok result', async () => {
    mockedGetToken.mockResolvedValue('test-token');
    mockedRunPipeline.mockResolvedValue(MOCK_PIPELINE_RESULT);
    mockedUploadBlobs.mockResolvedValue(undefined);

    const ctx = createMockContext();
    const result = await handleMetadataGeneration(ctx);

    expect(result.status).toBe('ok');
    expect(result.blobsUploaded).toBe(6);
    expect(result.stages).toHaveProperty('auth');
    expect(result.stages).toHaveProperty('pipeline');
    expect(result.stages).toHaveProperty('upload');
    expect(result.stages.auth.duration).toBeGreaterThanOrEqual(0);
    expect(result.stages.pipeline.duration).toBeGreaterThanOrEqual(0);
    expect(result.stages.upload.duration).toBeGreaterThanOrEqual(0);
    expect(result.duration).toBeGreaterThanOrEqual(0);

    expect(mockedGetToken).toHaveBeenCalledOnce();
    expect(mockedRunPipeline).toHaveBeenCalledWith('test-token', 'https://test.sharepoint.com');
    expect(mockedUploadBlobs).toHaveBeenCalledOnce();
  });

  it('logs structured stage messages', async () => {
    mockedGetToken.mockResolvedValue('test-token');
    mockedRunPipeline.mockResolvedValue(MOCK_PIPELINE_RESULT);
    mockedUploadBlobs.mockResolvedValue(undefined);

    const ctx = createMockContext();
    await handleMetadataGeneration(ctx);

    const logCalls = (ctx.log as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: any[]) => c[0],
    );

    expect(logCalls.some((msg: string) => /\[stage:auth\] completed in \d+ms/.test(msg))).toBe(true);
    expect(logCalls.some((msg: string) => /\[stage:pipeline\] completed in \d+ms/.test(msg))).toBe(true);
    expect(logCalls.some((msg: string) => /\[stage:upload\] completed in \d+ms/.test(msg))).toBe(true);
    expect(logCalls.some((msg: string) => /Pipeline complete: 6 blobs uploaded in \d+ms/.test(msg))).toBe(true);
  });

  it('if pipeline fails, throws error without calling uploadBlobs', async () => {
    mockedGetToken.mockResolvedValue('test-token');
    mockedRunPipeline.mockRejectedValue(new Error('SharePoint unavailable'));

    const ctx = createMockContext();

    await expect(handleMetadataGeneration(ctx)).rejects.toThrow('SharePoint unavailable');
    expect(mockedUploadBlobs).not.toHaveBeenCalled();
  });

  it('if SP_URL is missing, throws descriptive error', async () => {
    delete process.env.SP_URL;
    mockedGetToken.mockResolvedValue('test-token');

    const ctx = createMockContext();

    await expect(handleMetadataGeneration(ctx)).rejects.toThrow(/SP_URL/);
  });

  it('logs retry context if present', async () => {
    mockedGetToken.mockResolvedValue('test-token');
    mockedRunPipeline.mockResolvedValue(MOCK_PIPELINE_RESULT);
    mockedUploadBlobs.mockResolvedValue(undefined);

    const ctx = createMockContext({ retryCount: 1, maxRetryCount: 2 });
    await handleMetadataGeneration(ctx);

    const logCalls = (ctx.log as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: any[]) => c[0],
    );

    expect(logCalls.some((msg: string) => /\[retry\]/.test(msg))).toBe(true);
  });
});
