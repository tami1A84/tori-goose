import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Zap,
  Play,
  Square,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  setConfigProvider,
  updateCustomProvider,
  createCustomProvider,
  getCustomProvider,
} from '../../../api';
import { useModelAndProvider } from '../../ModelAndProviderContext';
import { defineMessages, useIntl } from '../../../i18n';

const i18n = defineMessages({
  inferenceMesh: { id: 'meshSettings.inferenceMesh', defaultMessage: 'Inference Mesh' },
  failedToActivateModel: {
    id: 'meshSettings.failedToActivateModel',
    defaultMessage: 'Failed to activate model: {error}',
  },
  inviteTokenRequired: {
    id: 'meshSettings.inviteTokenRequired',
    defaultMessage: 'Paste an invite token to join a mesh',
  },
  failedToStartMesh: { id: 'meshSettings.failedToStartMesh', defaultMessage: 'Failed to start mesh-llm' },
  meshReadyTimeout: {
    id: 'meshSettings.meshReadyTimeout',
    defaultMessage: 'mesh-llm did not become ready. Check ~/.mesh-llm/mesh-llm.log',
  },
  failedToStart: { id: 'meshSettings.failedToStart', defaultMessage: 'Failed to start: {error}' },
  failedToStopMesh: { id: 'meshSettings.failedToStopMesh', defaultMessage: 'Failed to stop mesh-llm' },
  runningStatus: {
    id: 'meshSettings.runningStatus',
    defaultMessage: 'Running — {modelCount, plural, one {# model} other {# models}} available',
  },
  peerCount: { id: 'meshSettings.peerCount', defaultMessage: '{peerCount, plural, one {# peer} other {# peers}}' },
  startingStatus: {
    id: 'meshSettings.startingStatus',
    defaultMessage: 'Starting — this may take a minute if downloading a model...',
  },
  downloadingStatus: {
    id: 'meshSettings.downloadingStatus',
    defaultMessage: 'Downloading latest mesh-llm (~19 MB)...',
  },
  notInstalledStatus: { id: 'meshSettings.notInstalledStatus', defaultMessage: 'mesh-llm not installed' },
  notRunning: { id: 'meshSettings.notRunning', defaultMessage: 'Not running' },
  checking: { id: 'meshSettings.checking', defaultMessage: 'Checking...' },
  learnMore: { id: 'meshSettings.learnMore', defaultMessage: 'Learn more' },
  experimental: { id: 'meshSettings.experimental', defaultMessage: 'Experimental.' },
  description: {
    id: 'meshSettings.description',
    defaultMessage:
      'Pool GPUs with others for decentralized LLM inference — no API keys, no cloud. Start a private mesh, join one with an invite token, or discover public meshes.',
  },
  getStarted: { id: 'meshSettings.getStarted', defaultMessage: 'Get started' },
  installDescription: {
    id: 'meshSettings.installDescription',
    defaultMessage:
      'mesh-llm is not installed. Follow the install guide to set it up, or connect to a mesh already running on this machine.',
  },
  installGuide: { id: 'meshSettings.installGuide', defaultMessage: 'Install guide' },
  checkAgain: { id: 'meshSettings.checkAgain', defaultMessage: 'Check Again' },
  downloadTitle: { id: 'meshSettings.downloadTitle', defaultMessage: 'Downloading latest mesh-llm...' },
  downloadDescription: {
    id: 'meshSettings.downloadDescription',
    defaultMessage: 'Fetching the latest version to ~/.mesh-llm/. This should only take a moment.',
  },
  autoDiscover: { id: 'meshSettings.autoDiscover', defaultMessage: 'Auto-discover a public mesh' },
  autoDiscoverDescription: {
    id: 'meshSettings.autoDiscoverDescription',
    defaultMessage: 'Find and join the best available mesh automatically.',
  },
  publicMeshWarning: {
    id: 'meshSettings.publicMeshWarning',
    defaultMessage:
      'Public meshes are run by volunteers. Your prompts are sent to their hardware — no privacy guarantees.',
  },
  joinWithInviteToken: { id: 'meshSettings.joinWithInviteToken', defaultMessage: 'Join with invite token' },
  joinWithInviteTokenDescription: {
    id: 'meshSettings.joinWithInviteTokenDescription',
    defaultMessage: 'Join a private mesh someone shared with you.',
  },
  startNewPrivateMesh: { id: 'meshSettings.startNewPrivateMesh', defaultMessage: 'Start a new private mesh' },
  startNewPrivateMeshDescription: {
    id: 'meshSettings.startNewPrivateMeshDescription',
    defaultMessage: 'Create your own mesh. Share the invite token with others to pool GPUs.',
  },
  modelToServe: { id: 'meshSettings.modelToServe', defaultMessage: 'Model to serve' },
  modelDownloadHint: {
    id: 'meshSettings.modelDownloadHint',
    defaultMessage: 'Downloads automatically if not already cached. Larger models need more VRAM.',
  },
  inviteToken: { id: 'meshSettings.inviteToken', defaultMessage: 'Invite token' },
  inviteTokenPlaceholder: { id: 'meshSettings.inviteTokenPlaceholder', defaultMessage: 'Paste invite token here' },
  contributeGpu: { id: 'meshSettings.contributeGpu', defaultMessage: 'Contribute GPU' },
  serveModelsForOthers: { id: 'meshSettings.serveModelsForOthers', defaultMessage: '(serve models for others too)' },
  startMesh: { id: 'meshSettings.startMesh', defaultMessage: 'Start Mesh' },
  keepGooseRunning: {
    id: 'meshSettings.keepGooseRunning',
    defaultMessage: 'When you start the mesh, keep goose running to stay connected.',
  },
  startingTitle: { id: 'meshSettings.startingTitle', defaultMessage: 'Starting mesh-llm...' },
  startingDescription: {
    id: 'meshSettings.startingDescription',
    defaultMessage: 'Connecting to the mesh and loading models. This may take a minute on first run.',
  },
  shareTokenDescription: {
    id: 'meshSettings.shareTokenDescription',
    defaultMessage: 'Share this with others so they can join your mesh.',
  },
  copied: { id: 'meshSettings.copied', defaultMessage: 'Copied' },
  copy: { id: 'meshSettings.copy', defaultMessage: 'Copy' },
  availableModels: { id: 'meshSettings.availableModels', defaultMessage: 'Available Models' },
  selectModel: { id: 'meshSettings.selectModel', defaultMessage: 'Select a model to use it as your Goose provider.' },
  live: { id: 'meshSettings.live', defaultMessage: 'live' },
  active: { id: 'meshSettings.active', defaultMessage: 'Active' },
  use: { id: 'meshSettings.use', defaultMessage: 'Use' },
  noModels: {
    id: 'meshSettings.noModels',
    defaultMessage: 'Mesh is running but no models are available yet. A model may still be loading.',
  },
  keepGooseRunningConnected: {
    id: 'meshSettings.keepGooseRunningConnected',
    defaultMessage: 'Keep goose running to stay connected to the mesh.',
  },
  stopMesh: { id: 'meshSettings.stopMesh', defaultMessage: 'Stop Mesh' },
  openConsole: { id: 'meshSettings.openConsole', defaultMessage: 'Open Console' },
  advanced: { id: 'meshSettings.advanced', defaultMessage: 'Advanced' },
  binary: { id: 'meshSettings.binary', defaultMessage: 'Binary' },
  apiEndpoint: { id: 'meshSettings.apiEndpoint', defaultMessage: 'API endpoint' },
  console: { id: 'meshSettings.console', defaultMessage: 'Console' },
  refresh: { id: 'meshSettings.refresh', defaultMessage: 'Refresh' },
});
const MESH_API_PORT = 9337;
const MESH_CONSOLE_PORT = 3131;
const MESH_DEFAULT_MODEL = 'Qwen3-30B-A3B-Q4_K_M';

// Popular models from mesh-llm catalog, grouped by size
const MODEL_CATALOG = [
  { name: 'Qwen3-4B-Q4_K_M', size: '~3 GB', tier: 'small' },
  { name: 'Qwen3-8B-Q4_K_M', size: '~5 GB', tier: 'small' },
  { name: 'Qwen3-14B-Q4_K_M', size: '~9 GB', tier: 'medium' },
  { name: 'Devstral-Small-2505-Q4_K_M', size: '~14 GB', tier: 'medium' },
  { name: 'Qwen3-30B-A3B-Q4_K_M', size: '~17 GB', tier: 'large' },
  { name: 'GLM-4.7-Flash-Q4_K_M', size: '~17 GB', tier: 'large' },
  { name: 'Qwen3-32B-Q4_K_M', size: '~20 GB', tier: 'large' },
  { name: 'Qwen2.5-Coder-32B-Instruct-Q4_K_M', size: '~20 GB', tier: 'large' },
  { name: 'Qwen2.5-72B-Instruct-Q4_K_M', size: '~42 GB', tier: 'xlarge' },
];

type MeshMode = 'new' | 'join' | 'auto';
type MeshStatus = 'unknown' | 'running' | 'stopped' | 'starting' | 'not-installed' | 'downloading';

interface MeshStatusInfo {
  running: boolean;
  installed: boolean;
  models: string[];
  token?: string;
  peerCount?: number;
  nodeStatus?: string;
  binaryPath?: string;
}

export const MeshSettings = () => {
  const intl = useIntl();
  const { refreshCurrentModelAndProvider } = useModelAndProvider();
  const isMacOS = window.electron.platform === 'darwin' && window.electron.arch === 'arm64';
  const [status, setStatus] = useState<MeshStatus>('unknown');
  const [statusInfo, setStatusInfo] = useState<MeshStatusInfo>({
    running: false,
    installed: true,
    models: [],
  });
  const [mode, setMode] = useState<MeshMode>('auto');
  const [selectedModel, setSelectedModel] = useState(MESH_DEFAULT_MODEL);
  const [joinToken, setJoinToken] = useState('');
  const [contributeGpu, setContributeGpu] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [meshProviderId, setMeshProviderIdState] = useState<string>(
    () => localStorage.getItem('mesh-provider-id') ?? 'mesh'
  );
  const setMeshProviderId = (id: string) => {
    setMeshProviderIdState(id);
    localStorage.setItem('mesh-provider-id', id);
  };
  const [checking, setChecking] = useState(false);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const result = await window.electron.checkMesh();
      if (result.running) {
        setStatus('running');
        setStatusInfo(result);
      } else if (!result.installed && !isMacOS) {
        // On non-macOS, binary must be manually installed.
        setStatus((prev) => (prev === 'downloading' ? prev : 'not-installed'));
        setStatusInfo({ running: false, installed: false, models: [] });
      } else {
        // On macOS, start-mesh handles downloading, so treat not-installed as stopped.
        setStatus((prev) => (prev === 'starting' || prev === 'downloading' ? prev : 'stopped'));
        setStatusInfo({ ...result, models: [] });
      }
    } catch {
      setStatus((prev) => (prev === 'starting' || prev === 'downloading' ? prev : 'stopped'));
    } finally {
      setChecking(false);
    }
  }, [isMacOS]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, status === 'starting' ? 3000 : 10000);
    return () => clearInterval(interval);
  }, [checkStatus, status]);

  const meshProviderBody = (models: string[]) => ({
    engine: 'openai_compatible' as const,
    display_name: intl.formatMessage(i18n.inferenceMesh),
    api_url: `http://localhost:${MESH_API_PORT}`,
    api_key: '',
    models,
    supports_streaming: true,
    requires_auth: false,
  });

  // Create or update the mesh custom provider via the REST API,
  // which handles file writes and registry refresh atomically.
  // Returns the provider ID to use with setConfigProvider.
  const ensureMeshProvider = async (models: string[]): Promise<string> => {
    const modelList = models.length > 0 ? models : [MESH_DEFAULT_MODEL];
    const body = meshProviderBody(modelList);

    // Try the last-known provider ID first, then fall back to 'mesh'
    const idsToTry = meshProviderId === 'mesh' ? ['mesh'] : [meshProviderId, 'mesh'];

    for (const id of idsToTry) {
      const existing = await getCustomProvider({ path: { id } });
      if (existing.data) {
        await updateCustomProvider({
          path: { id },
          body,
          throwOnError: true,
        });
        setMeshProviderId(id);
        return id;
      }
    }

    // Provider doesn't exist yet — create it
    const result = await createCustomProvider({
      body,
      throwOnError: true,
    });
    const newId = result.data?.provider_name ?? 'mesh';
    setMeshProviderId(newId);
    return newId;
  };

  const activateModel = async (modelId: string) => {
    setSaving(true);
    setError(null);
    try {
      const providerId = await ensureMeshProvider(statusInfo.models);
      await setConfigProvider({
        body: { provider: providerId, model: modelId },
        throwOnError: true,
      });
      await refreshCurrentModelAndProvider();
      setActiveModel(modelId);
    } catch (err) {
      setError(intl.formatMessage(i18n.failedToActivateModel, { error: String(err) }));
    } finally {
      setSaving(false);
    }
  };

  const startMesh = async () => {
    setError(null);
    // On macOS, start-mesh downloads the latest binary first.
    setStatus(isMacOS ? 'downloading' : 'starting');
    try {
      const args: string[] = [];

      if (mode === 'new') {
        args.push('serve', '--model', selectedModel);
      } else if (mode === 'join') {
        if (!joinToken.trim()) {
          setError(intl.formatMessage(i18n.inviteTokenRequired));
          setStatus('stopped');
          return;
        }
        if (contributeGpu) {
          args.push('serve', '--join', joinToken.trim());
        } else {
          args.push('client', '--join', joinToken.trim());
        }
      } else {
        // auto
        if (contributeGpu) {
          args.push('serve', '--auto');
        } else {
          args.push('client', '--auto');
        }
      }

      const result = await window.electron.startMesh(args);
      if (!result.started) {
        setError(result.error || intl.formatMessage(i18n.failedToStartMesh));
        setStatus('stopped');
        return;
      }
      setStatus('starting');
      // Polling will pick up when it's ready. Timeout after 5 min so
      // the UI doesn't get stuck in "starting" if the daemon crashes.
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      startTimeoutRef.current = setTimeout(() => {
        startTimeoutRef.current = null;
        setStatus((prev) => {
          if (prev === 'starting') {
            setError(intl.formatMessage(i18n.meshReadyTimeout));
            return 'stopped';
          }
          return prev;
        });
      }, 300000);
    } catch (err) {
      setError(intl.formatMessage(i18n.failedToStart, { error: String(err) }));
      setStatus('stopped');
    }
  };

  const stopMesh = async () => {
    try {
      const result = await window.electron.stopMesh();
      if (result.stopped) {
        setStatus('stopped');
        setStatusInfo((prev) => ({ ...prev, running: false, models: [], token: undefined }));
      } else {
        setError(intl.formatMessage(i18n.failedToStopMesh));
      }
    } catch {
      setError(intl.formatMessage(i18n.failedToStopMesh));
    }
  };

  const copyToken = () => {
    if (statusInfo.token) {
      navigator.clipboard.writeText(statusInfo.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const StatusIndicator = () => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-xs text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {intl.formatMessage(i18n.runningStatus, { modelCount: statusInfo.models.length })}
            {statusInfo.peerCount !== undefined && statusInfo.peerCount > 0 && (
              <span className="text-text-muted ml-1">
                · {intl.formatMessage(i18n.peerCount, { peerCount: statusInfo.peerCount })}
              </span>
            )}
          </span>
        );
      case 'starting':
        return (
          <span className="flex items-center gap-1.5 text-xs text-yellow-500">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {intl.formatMessage(i18n.startingStatus)}
          </span>
        );
      case 'downloading':
        return (
          <span className="flex items-center gap-1.5 text-xs text-yellow-500">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {intl.formatMessage(i18n.downloadingStatus)}
          </span>
        );
      case 'not-installed':
        return (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            {intl.formatMessage(i18n.notInstalledStatus)}
          </span>
        );
      case 'stopped':
        return (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            {checking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-400" />
            )}
            {intl.formatMessage(i18n.notRunning)}
          </span>
        );
      default:
        return checking ? (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {intl.formatMessage(i18n.checking)}
          </span>
        ) : null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-text-default font-medium">{intl.formatMessage(i18n.inferenceMesh)}</h3>
          <a
            href="https://docs.anarchai.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-text-muted hover:text-text-default transition-colors"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            {intl.formatMessage(i18n.learnMore)}
          </a>
        </div>
        <p className="text-xs text-text-muted max-w-2xl mt-1">
          <span className="text-orange-400 font-medium">{intl.formatMessage(i18n.experimental)}</span>{' '}
          {intl.formatMessage(i18n.description)}{' '}
          <a
            href="https://docs.anarchai.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-default"
          >
            docs.anarchai.org
          </a>
        </p>
        <div className="mt-2">
          <StatusIndicator />
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      {/* Not installed — non-macOS only; on macOS start-mesh handles the download */}
      {status === 'not-installed' && (
        <div className="border border-border-subtle rounded-xl p-4 bg-background-default">
          <p className="text-sm font-medium text-text-default">{intl.formatMessage(i18n.getStarted)}</p>
          <p className="text-xs text-text-muted mt-1">
            {intl.formatMessage(i18n.installDescription)}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <a href="https://docs.anarchai.org/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                {intl.formatMessage(i18n.installGuide)}
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={checkStatus}>
              <RefreshCw className="w-3 h-3 mr-1" />
              {intl.formatMessage(i18n.checkAgain)}
            </Button>
          </div>
        </div>
      )}

      {/* Downloading */}
      {status === 'downloading' && (
        <div className="border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5">
          <p className="text-sm font-medium text-text-default">{intl.formatMessage(i18n.downloadTitle)}</p>
          <p className="text-xs text-text-muted mt-1">
            {intl.formatMessage(i18n.downloadDescription)}
          </p>
        </div>
      )}

      {/* Setup panel — shown when stopped and installed */}
      {(status === 'stopped' || status === 'unknown') && (
        <div className="border border-border-subtle rounded-xl p-4 bg-background-default space-y-4">
          {/* Mode selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mesh-mode"
                checked={mode === 'auto'}
                onChange={() => setMode('auto')}
              />
              <div>
                <span className="text-sm font-medium text-text-default">
                  {intl.formatMessage(i18n.autoDiscover)}
                </span>
                <p className="text-xs text-text-muted">
                  {intl.formatMessage(i18n.autoDiscoverDescription)}
                </p>
                <p className="text-xs text-orange-400 mt-0.5">
                  {intl.formatMessage(i18n.publicMeshWarning)}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mesh-mode"
                checked={mode === 'join'}
                onChange={() => setMode('join')}
              />
              <div>
                <span className="text-sm font-medium text-text-default">
                  {intl.formatMessage(i18n.joinWithInviteToken)}
                </span>
                <p className="text-xs text-text-muted">
                  {intl.formatMessage(i18n.joinWithInviteTokenDescription)}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mesh-mode"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
              />
              <div>
                <span className="text-sm font-medium text-text-default">
                  {intl.formatMessage(i18n.startNewPrivateMesh)}
                </span>
                <p className="text-xs text-text-muted">
                  {intl.formatMessage(i18n.startNewPrivateMeshDescription)}
                </p>
              </div>
            </label>
          </div>

          {/* Mode-specific options */}
          {mode === 'new' && (
            <div className="pl-6 space-y-2">
              <label className="text-xs text-text-default block">{intl.formatMessage(i18n.modelToServe)}</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-sm bg-background-default border border-border-subtle rounded px-2 py-1.5 text-text-default w-full max-w-sm"
              >
                {MODEL_CATALOG.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.size})
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted">
                {intl.formatMessage(i18n.modelDownloadHint)}
              </p>
            </div>
          )}

          {mode === 'join' && (
            <div className="pl-6 space-y-2">
              <label className="text-xs text-text-default block">{intl.formatMessage(i18n.inviteToken)}</label>
              <Input
                type="text"
                value={joinToken}
                onChange={(e) => setJoinToken(e.target.value)}
                placeholder={intl.formatMessage(i18n.inviteTokenPlaceholder)}
                className="max-w-md"
              />
            </div>
          )}

          {(mode === 'auto' || mode === 'join') && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contributeGpu}
                onChange={(e) => setContributeGpu(e.target.checked)}
              />
              <span className="text-sm text-text-default">
                {intl.formatMessage(i18n.contributeGpu)}
                <span className="text-text-muted ml-1">{intl.formatMessage(i18n.serveModelsForOthers)}</span>
              </span>
            </label>
          )}

          <Button onClick={startMesh} disabled={checking} size="sm">
            <Play className="w-3 h-3 mr-1" />
            {intl.formatMessage(i18n.startMesh)}
          </Button>

          <p className="text-xs text-text-muted">
            {intl.formatMessage(i18n.keepGooseRunning)}
          </p>
        </div>
      )}

      {/* Starting indicator */}
      {status === 'starting' && (
        <div className="border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5">
          <p className="text-sm font-medium text-text-default">{intl.formatMessage(i18n.startingTitle)}</p>
          <p className="text-xs text-text-muted mt-1">
            {intl.formatMessage(i18n.startingDescription)}
          </p>
        </div>
      )}

      {/* Running state */}
      {status === 'running' && (
        <>
          {/* Invite token */}
          {statusInfo.token && (
            <div className="border border-border-subtle rounded-xl p-4 bg-background-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-default">{intl.formatMessage(i18n.inviteToken)}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {intl.formatMessage(i18n.shareTokenDescription)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={copyToken}>
                  {copiedToken ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      {intl.formatMessage(i18n.copied)}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      {intl.formatMessage(i18n.copy)}
                    </>
                  )}
                </Button>
              </div>
              <code className="block text-xs bg-background-default border border-border-subtle rounded p-2 mt-2 text-text-muted break-all select-all max-h-16 overflow-auto">
                {statusInfo.token}
              </code>
            </div>
          )}

          {/* Model list */}
          {statusInfo.models.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-default mb-2">{intl.formatMessage(i18n.availableModels)}</h4>
              <p className="text-xs text-text-muted mb-3">
                {intl.formatMessage(i18n.selectModel)}
              </p>
              <div className="space-y-2">
                {statusInfo.models.map((modelId) => {
                  const isActive = activeModel === modelId;
                  return (
                    <div
                      key={modelId}
                      className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border-subtle bg-background-default hover:border-border-default'
                      }`}
                      onClick={() => !saving && activateModel(modelId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-default">{modelId}</span>
                          <span className="text-xs text-green-500">{intl.formatMessage(i18n.live)}</span>
                        </div>
                        {isActive ? (
                          <span className="text-xs font-medium text-green-500">{intl.formatMessage(i18n.active)}</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              activateModel(modelId);
                            }}
                            disabled={saving}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {intl.formatMessage(i18n.use)}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {statusInfo.models.length === 0 && (
            <p className="text-xs text-text-muted">
              {intl.formatMessage(i18n.noModels)}
            </p>
          )}

          <p className="text-xs text-text-muted">
            {intl.formatMessage(i18n.keepGooseRunningConnected)}
          </p>

          {/* Actions row */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={stopMesh}>
              <Square className="w-3 h-3 mr-1" />
              {intl.formatMessage(i18n.stopMesh)}
            </Button>
            <a
              href={`http://localhost:${MESH_CONSOLE_PORT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-text-muted hover:text-text-default transition-colors px-2 py-1"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {intl.formatMessage(i18n.openConsole)}
            </a>
          </div>
        </>
      )}

      {/* Advanced settings */}
      <div className="border-t border-border-subtle pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-default transition-colors"
        >
          {showAdvanced ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {intl.formatMessage(i18n.advanced)}
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3">
            {statusInfo.binaryPath && (
              <div>
                <label className="text-xs text-text-muted block">{intl.formatMessage(i18n.binary)}</label>
                <code className="text-xs text-text-default">{statusInfo.binaryPath}</code>
              </div>
            )}
            <div>
              <label className="text-xs text-text-muted block">{intl.formatMessage(i18n.apiEndpoint)}</label>
              <code className="text-xs text-text-default">http://localhost:{MESH_API_PORT}/v1</code>
            </div>
            <div>
              <label className="text-xs text-text-muted block">{intl.formatMessage(i18n.console)}</label>
              <code className="text-xs text-text-default">
                http://localhost:{MESH_CONSOLE_PORT}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={checkStatus}>
          <RefreshCw className="w-3 h-3 mr-1" />
          {intl.formatMessage(i18n.refresh)}
        </Button>
      </div>
    </div>
  );
};
