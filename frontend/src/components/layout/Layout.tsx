import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  lastUpdate: Date;
  onRefresh: () => void;
  isOnline: boolean;
}

export const Layout = ({ children, lastUpdate, onRefresh, isOnline }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOnline={isOnline} />
      <div className="ml-64">
        <Header lastUpdate={lastUpdate} onRefresh={onRefresh} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
