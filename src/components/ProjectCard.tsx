import { useEffect, useState } from 'react';
import type { Project, Status } from '../types';
import { ChevronIcon, LinkIcon, LogIcon, PlayIcon, StopIcon, TrashIcon } from './icons';

interface Props {
  project: Project;
  versions: string[];
  status: Status;
  logActive: boolean;
  onChange: (patch: Partial<Project>) => void;
  onDelete: () => void;
  onStart: () => void;
  onStop: () => void;
  onLog: () => void;
  onFocusDir: () => void;
}

const STATUS_LABEL: Record<Status, string> = {
  stopped: 'Parado',
  starting: 'Iniciando…',
  ready: 'Em execução',
};

export function ProjectCard(p: Props) {
  const { project, status } = p;
  const [scripts, setScripts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const busy = status !== 'stopped';

  // Valida o package.json e carrega os scripts sempre que o diretório muda.
  useEffect(() => {
    const dir = project.dir.trim();
    if (!dir) {
      setScripts([]);
      setError(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const r = await window.api.inspectProject(dir);
      if (cancelled) return;
      if (r.ok) {
        setScripts(r.scripts);
        setError(null);
      } else {
        setScripts([]);
        setError(r.error);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [project.dir]);

  const pickFolder = async () => {
    const dir = await window.api.pickFolder();
    if (dir) p.onChange({ dir, script: '' });
  };

  const ready = !!project.dir && !!project.nodeVersion && !!project.script && !error;

  return (
    <div className={`card ${status === 'ready' ? 'is-live' : ''}`}>
      <div className="card-top">
        <span className={`dot dot-${status}`} role="status" aria-label={STATUS_LABEL[status]} title={STATUS_LABEL[status]} />
        <button className="icon-btn danger" onClick={p.onDelete} aria-label="Excluir projeto" title="Excluir projeto">
          <TrashIcon />
        </button>
      </div>

      <div className="row">
        <button className="pill" onClick={pickFolder} disabled={busy} title="Escolher pasta do projeto">
          Diretório do projeto <LinkIcon />
        </button>
        <input
          className="path"
          value={project.dir}
          disabled={busy}
          spellCheck={false}
          placeholder="C:\GIT\COMPANY\PROJECT-ANGULAR-UI"
          aria-label="Caminho do projeto"
          onFocus={p.onFocusDir}
          onChange={(e) => p.onChange({ dir: e.target.value })}
        />
      </div>

      <div className="row row-controls">
        <label className="select-wrap">
          <select
            value={p.versions.includes(project.nodeVersion) ? project.nodeVersion : ''}
            disabled={busy}
            onChange={(e) => p.onChange({ nodeVersion: e.target.value })}
            aria-label="Versão do Node (fnm)"
          >
            <option value="" disabled>Selecionar versão do Angular</option>
            {p.versions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <ChevronIcon />
        </label>

        <label className="select-wrap">
          <select
            value={scripts.includes(project.script) ? project.script : ''}
            disabled={busy || !scripts.length}
            onChange={(e) => p.onChange({ script: e.target.value })}
            aria-label="Script do package.json"
          >
            <option value="" disabled>Selecionar o script Angular</option>
            {scripts.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronIcon />
        </label>

        <div className="actions">
          <button
            className={`icon-btn start ${busy ? 'on' : ''}`}
            onClick={p.onStart}
            disabled={busy || !ready}
            aria-label="Iniciar"
            title="Iniciar"
          >
            <PlayIcon />
          </button>
          <button className="icon-btn stop" onClick={p.onStop} disabled={!busy} aria-label="Parar" title="Parar">
            <StopIcon />
          </button>
          <button className={`icon-btn log ${p.logActive ? 'on' : ''}`} onClick={p.onLog} aria-label="Ver logs" title="Ver logs">
            <LogIcon />
          </button>
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
