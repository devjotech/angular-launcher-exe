import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project, Status, Workspace } from './types';
import { WorkspaceBlock } from './components/WorkspaceBlock';
import { LogPanel } from './components/LogPanel';
import { PlusIcon } from './components/icons';

const uid = () => crypto.randomUUID();
const newProject = (): Project => ({ id: uid(), dir: '', nodeVersion: '', script: '' });
const newWorkspace = (n: number): Workspace => ({ id: uid(), name: `Workspace ${n}`, projects: [newProject()] });
const LOG_LIMIT = 200_000;

export default function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);
  const [fnmError, setFnmError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [logId, setLogId] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const logIdRef = useRef<string | null>(null);
  logIdRef.current = logId;

  const refreshVersions = useCallback(async () => {
    const r = await window.api.listNodeVersions();
    setVersions(r.versions);
    setFnmError(r.ok ? null : r.error ?? 'fnm não encontrado.');
  }, []);

  // Carga inicial + assinatura dos eventos do processo.
  useEffect(() => {
    window.api.loadState().then((saved) => {
      setWorkspaces(saved.length ? saved : [newWorkspace(1)]);
      setLoaded(true);
    });
    refreshVersions();
    const offStatus = window.api.onStatus(({ id, status }) => setStatus((s) => ({ ...s, [id]: status })));
    const offData = window.api.onData(({ id, chunk }) => {
      if (id === logIdRef.current) setLog((l) => (l + chunk).slice(-LOG_LIMIT));
    });
    return () => {
      offStatus();
      offData();
    };
  }, [refreshVersions]);

  // Persistência (debounce).
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => window.api.saveState(workspaces), 400);
    return () => clearTimeout(t);
  }, [workspaces, loaded]);

  const openLog = async (id: string) => {
    setLogId(id);
    setLog(await window.api.getLog(id));
  };

  const mapWs = (wsId: string, fn: (w: Workspace) => Workspace) =>
    setWorkspaces((all) => all.map((w) => (w.id === wsId ? fn(w) : w)));

  const stopAll = (projects: Project[]) => projects.forEach((p) => window.api.stop(p.id));

  const startProject = async (p: Project) => {
    await openLog(p.id);
    await window.api.start(p.id, { dir: p.dir.trim(), nodeVersion: p.nodeVersion, script: p.script });
  };

  const logProject = workspaces.flatMap((w) => w.projects).find((p) => p.id === logId);
  const logTitle = logProject ? logProject.dir.split(/[\\/]/).filter(Boolean).pop() ?? 'Projeto' : null;

  return (
    <div className="app">
      <h1 className="title">Iniciar meus projetos Angular</h1>

      <div className="layout">
        <main>
          {fnmError && <p className="error banner" role="alert">{fnmError}</p>}

          {workspaces.map((ws) => (
            <WorkspaceBlock
              key={ws.id}
              workspace={ws}
              versions={versions}
              status={status}
              logProjectId={logId}
              onRename={(name) => mapWs(ws.id, (w) => ({ ...w, name }))}
              onDelete={() => {
                if (ws.projects.length && !window.confirm(`Excluir "${ws.name}" e seus projetos?`)) return;
                stopAll(ws.projects);
                setWorkspaces((all) => all.filter((w) => w.id !== ws.id));
              }}
              onAddProject={() => mapWs(ws.id, (w) => ({ ...w, projects: [...w.projects, newProject()] }))}
              onUpdateProject={(pid, patch) =>
                mapWs(ws.id, (w) => ({ ...w, projects: w.projects.map((p) => (p.id === pid ? { ...p, ...patch } : p)) }))
              }
              onDeleteProject={(pid) => {
                window.api.stop(pid);
                mapWs(ws.id, (w) => ({ ...w, projects: w.projects.filter((p) => p.id !== pid) }));
              }}
              onStart={startProject}
              onStop={(pid) => window.api.stop(pid)}
              onLog={openLog}
              onFocusDir={refreshVersions}
            />
          ))}

          <button className="pill pill-ok" onClick={() => setWorkspaces((all) => [...all, newWorkspace(all.length + 1)])}>
            Criar workspace <PlusIcon />
          </button>
        </main>

        <LogPanel
          title={logTitle}
          text={log}
          onClear={() => {
            if (logId) window.api.clearLog(logId);
            setLog('');
          }}
        />
      </div>
    </div>
  );
}
