import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle2,
  Timer,
  AlertTriangle,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  getCampaignTasks,
  getTaskUpdates,
  testClickUpConnection,
  getClients,
} from "@/lib/clickup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Campaign = {
  id: string;
  title: string;
  status: string;
  lastUpdate: string;
  updates: Array<{
    date: string;
    message: string;
  }>;
};

type Client = {
  id: string;
  name: string;
  company: string;
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? "dia" : "dias"} atrás`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? "minuto" : "minutos"} atrás`;
    } else {
      return "Agora mesmo";
    }
  } catch (error) {
    return "";
  }
}

export default function CampaignProgress() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  async function fetchCampaigns() {
    if (!selectedClientId) {
      setCampaigns([]);
      return;
    }

    try {
      setRefreshing(true);
      const tasks = await getCampaignTasks(selectedClientId);
      const campaignsWithUpdates = await Promise.all(
        tasks.map(async (task) => {
          const updates = await getTaskUpdates(task.id);
          return {
            id: task.id,
            title: task.name,
            status: task.status.status,
            lastUpdate: task.date_updated,
            updates: updates.map((update) => ({
              date: update.date,
              message: update.comment_text,
            })),
          };
        }),
      );
      setCampaigns(campaignsWithUpdates);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Error fetching campaigns",
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function initialize() {
      try {
        const result = await testClickUpConnection();
        if (!result.success) {
          setConnectionError(result.message);
          return;
        }

        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Error initializing:", error);
        setConnectionError(
          error instanceof Error ? error.message : "Error initializing",
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    if (!loading && selectedClientId) {
      fetchCampaigns();
    }
  }, [selectedClientId, loading]);

  if (loading) {
    return <div className="w-full p-6">Loading clients...</div>;
  }

  if (connectionError) {
    return (
      <div className="w-full p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Progress</h1>
          <p className="text-muted-foreground mt-2">
            Select a client to view their campaigns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedClientId && (
            <Button
              variant="outline"
              size="icon"
              onClick={fetchCampaigns}
              disabled={refreshing}
              className={refreshing ? "animate-spin" : ""}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!selectedClientId ? (
        <Card className="p-6 flex flex-col items-center justify-center space-y-4">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Select a Client</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Choose a client from the dropdown above to view their campaign
            progress and updates.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const StatusIcon =
                    campaign.status === "SOLICITAÇÃO"
                      ? Clock
                      : campaign.status === "EM ANÁLISE"
                        ? Timer
                        : campaign.status === "APROVADO"
                          ? CheckCircle2
                          : campaign.status === "EM ANDAMENTO"
                            ? Timer
                            : campaign.status === "CONCLUÍDO"
                              ? CheckCircle2
                              : Clock;

                  const statusColor =
                    campaign.status === "SOLICITAÇÃO"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : campaign.status === "EM ANÁLISE"
                        ? "bg-blue-500/10 text-blue-500"
                        : campaign.status === "APROVADO"
                          ? "bg-green-500/10 text-green-500"
                          : campaign.status === "EM ANDAMENTO"
                            ? "bg-purple-500/10 text-purple-500"
                            : campaign.status === "CONCLUÍDO"
                              ? "bg-gray-500/10 text-gray-500"
                              : "bg-yellow-500/10 text-yellow-500";

                  return (
                    <Card key={campaign.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{campaign.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={statusColor}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {campaign.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Última atualização:{" "}
                              {formatDate(campaign.lastUpdate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {campaigns.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No campaigns found for this client.
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id}>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      {campaign.title}
                    </h3>
                    <div className="space-y-4">
                      {campaign.updates.map((update, index) => (
                        <div key={index} className="relative pl-6">
                          <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-primary" />
                          <div className="space-y-1">
                            <p className="text-sm">{update.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(update.date)}
                            </p>
                          </div>
                          {index !== campaign.updates.length - 1 && (
                            <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-border" />
                          )}
                        </div>
                      ))}
                    </div>
                    {campaign.id !== campaigns[campaigns.length - 1].id && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No updates available.
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}
