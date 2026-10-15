import { useEffect, useRef } from 'react';

interface Props {
  title: string | null;
  text: string;
  onClear: () => void;
}

export function LogPanel({ title, text, onClear }: Props) {
  const ref = useRef<HTMLPreElement>(null);
  const stick = useRef(true);

  // Só acompanha o fim do log se a pessoa não rolou para cima.
  useEffect(() => {
    const el = ref.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <aside className="term" aria-label="Terminal do projeto">
      {title && (
        <div className="term-bar">
          <span>{title}</span>
          <button className="term-clear" onClick={onClear}>Limpar</button>
        </div>
      )}
      <pre
        ref={ref}
        className="term-body"
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
      >
        {title ? text : 'Clique em LOG em um projeto para acompanhar a saída dele aqui.\n\nC:\\>'}
      </pre>
    </aside>
  );
}
