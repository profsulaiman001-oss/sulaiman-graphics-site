import React from 'react';
import { 
  ShoppingBag, Award, FileText, ClipboardList, Receipt as ReceiptIcon, BarChart3, Send 
} from 'lucide-react';

interface AdminNavProps {
  setLocation: (loc: string) => void;
  setIsCertOpen: (open: boolean) => void;
}

export function AdminNav({ setLocation, setIsCertOpen }: AdminNavProps) {
  const adminItems = [
    { label: 'Create New Post', icon: Send, path: '/create-post' },
    { label: 'View Questionnaires', icon: ClipboardList, path: '/questionnaires' },
    { label: 'Generate Receipt', icon: ReceiptIcon, path: '/receipt' },
    { label: 'Ownership Certificate', icon: Award, action: () => setIsCertOpen(true) },
    { label: 'View Agreements', icon: FileText, path: '/agreements' },
    { label: 'Studio Insights', icon: BarChart3, path: '/studio-insights' },
    { label: 'Generate Invoice', icon: FileText, path: '/invoice' },
    { label: 'Manage Storefront', icon: ShoppingBag, path: '/admin/manage-shop' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {adminItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if ('action' in item && typeof item.action === 'function') {
              item.action();
            } else if (item.path) {
              setLocation(item.path);
            }
          }}
          className="flex flex-col items-center justify-center p-5 bg-card/50 border border-border/50 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-950/10 transition-all duration-300 group"
        >
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-cyan-500 shadow-sm group-hover:scale-105 transition-transform">
            <item.icon size={20} />
          </div>
          <span className="mt-3 text-xs font-medium text-muted-foreground group-hover:text-foreground text-center line-clamp-1">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
