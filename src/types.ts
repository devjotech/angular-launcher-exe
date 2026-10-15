export type Status = 'stopped' | 'starting' | 'ready';

export interface Project {
  id: string;
  dir: string;
  nodeVersion: string;
  script: string;
}
export interface Workspace {
  id: string;
  name: string;
  projects: Project[];
}
export interface StartArgs {
  dir: string;
  nodeVersion: string;
  script: string;
}

declare global {
  interface Window {
    api: {
      loadState(): Promise<Workspace[]>;
      saveState(data: Workspace[]): Promise<void>;
      pickFolder(): Promise<string | null>;
      inspectProject(dir: string): Promise<{ ok: true; scripts: string[]; name: string } | { ok: false; error: string }>;
      listNodeVersions(): Promise<{ ok: boolean; versions: string[]; error?: string }>;
      start(id: string, args: StartArgs): Promise<{ ok: boolean; error?: string }>;
      stop(id: string): Promise<{ ok: boolean }>;
      getLog(id: string): Promise<string>;
      clearLog(id: string): Promise<void>;
      onStatus(cb: (p: { id: string; status: Status }) => void): () => void;
      onData(cb: (p: { id: string; chunk: string }) => void): () => void;
    };
  }
}
