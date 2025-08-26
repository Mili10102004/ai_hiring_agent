import React from "react";

export interface Application {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  summary: string;
}

interface ApplicationsSidebarProps {
  applications: Application[];
  onSelect: (id: string) => void;
}

export const ApplicationsSidebar: React.FC<ApplicationsSidebarProps> = ({ applications, onSelect }) => {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <h2 className="p-4 font-bold text-lg border-b border-border">Applications</h2>
      <ul className="flex-1 overflow-y-auto">
        {applications.length === 0 ? (
          <li className="p-4 text-muted">No applications yet.</li>
        ) : (
          applications.map(app => (
            <li
              key={app.id}
              className="p-4 cursor-pointer hover:bg-muted"
              onClick={() => onSelect(app.id)}
            >
              <div className="font-semibold">{app.name}</div>
              <div className="text-xs text-muted">{app.email}</div>
              <div className="text-xs text-muted">{new Date(app.submittedAt).toLocaleString()}</div>
              <div className="text-xs mt-1">{app.summary}</div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};
