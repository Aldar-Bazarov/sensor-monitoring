import { ChartLine, SmartphoneNfc, Table } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './components/ui/sidebar';
import { ThemeToggle } from './components/ui/theme-toggle';
import { ReactNode, useState } from 'react';
import { IMenuItem } from './types';
import { TableView } from './components/views/table-view/table-view';
import { ChartView } from './components/views/graph-view/chart-view';
import { Toaster } from './components/ui/toaster';
import { ImportXML } from './components/views/import-xml/import-xml';
import { ExportXml } from './components/views/export-xml/export-xml';

const menuItems: IMenuItem[] = [
  {
    icon: <Table />,
    title: 'Таблица',
    child: <TableView />,
  },
  {
    icon: <ChartLine />,
    title: 'График',
    child: <ChartView />,
  },
];

export const App = () => {
  const [currentChild, setCurrentChild] = useState<ReactNode>(menuItems[1].child);
  return (
    <SidebarProvider className="bg-background">
      <Sidebar className="bg-background">
        <SidebarHeader className="mt-5 ml-5 flex flex-row">
          <SmartphoneNfc />
          Sensor Web
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-5">
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="flex items-center gap-2 cursor-pointer"
                      isActive={currentChild === item.child}
                      onClick={() => setCurrentChild(item.child)}
                    >
                      <div>
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex-1 bg-secondary">
        <main className="bg-secondary">
          <header className="flex justify-between items-center h-16 bg-background w-full px-5 border">
            <SidebarTrigger />
            <div className="flex gap-x-4">
              <ImportXML />
              <ExportXml />
            </div>
          </header>
          <div className="flex-1 container mx-auto px-8 py-8">
            {currentChild}
            <Toaster />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
