import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Menu, Plus, Users, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getClients } from "@/lib/clickup";

type Client = {
  id: string;
  name: string;
  company: string;
  avatar_url?: string;
  role?: string;
};

export default function Sidebar() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function loadClients() {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    }
    loadClients();
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent clients={clients} />
      </div>
      <SheetContent side="left" className="lg:hidden">
        <SidebarContent clients={clients} />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({ clients }: { clients: Client[] }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-background">
      <SheetHeader className="p-6">
        <SheetTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          Client Profiles
        </SheetTitle>
      </SheetHeader>
      <Separator />

      <div className="p-4">
        <div className="grid grid-cols-1 gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/progress">
              <Clock className="mr-2 h-4 w-4" />
              Campaign Progress
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>

      <Separator />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {clients.map((client) => (
            <Sheet key={client.id}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={client.avatar_url} />
                    <AvatarFallback>
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {client.company}
                    </span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Client Profile</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <Card className="p-6 bg-accent/50">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={client.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {client.role}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {client.company}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
