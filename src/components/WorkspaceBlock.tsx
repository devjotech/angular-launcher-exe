import type { Project, Status, Workspace } from '../types';
import { ProjectCard } from './ProjectCard';
import { PlusIcon, TrashIcon } from './icons';

interface Props {
  workspace: Workspace;
  versions: string[];
  status: Record<string, Status>;
  logProjectId: string | null;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddProject: () => void;
  onUpdateProject: (pid: string, patch: Partial<Project>) => void;
  onDeleteProject: (pid: string) => void;
  onStart: (project: Project) => void;
  onStop: (pid: string) => void;
  onLog: (pid: string) => void;
  onFocusDir: () => void;
}

export function WorkspaceBlock(p: Props) {
  const { workspace: ws } = p;
  return (
    <section className="ws">
      <input
        className="ws-name"
        value={ws.name}
        onChange={(e) => p.onRename(e.target.value)}
        aria-label="Nome do workspace"
        spellCheck={false}
      />
      <button className="icon-btn danger ws-trash" onClick={p.onDelete} aria-label="Excluir workspace" title="Excluir workspace">
        <TrashIcon />
      </button>

      {ws.projects.map((pr) => (
        <ProjectCard
          key={pr.id}
          project={pr}
          versions={p.versions}
          status={p.status[pr.id] ?? 'stopped'}
          logActive={p.logProjectId === pr.id}
          onChange={(patch) => p.onUpdateProject(pr.id, patch)}
          onDelete={() => p.onDeleteProject(pr.id)}
          onStart={() => p.onStart(pr)}
          onStop={() => p.onStop(pr.id)}
          onLog={() => p.onLog(pr.id)}
          onFocusDir={p.onFocusDir}
        />
      ))}

      <div className="ws-footer">
        <button className="pill" onClick={p.onAddProject}>
          Add projeto <PlusIcon />
        </button>
      </div>
    </section>
  );
}
