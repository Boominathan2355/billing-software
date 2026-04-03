import type { ReactNode } from 'react';

interface Props {
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ onClose, title, children }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
