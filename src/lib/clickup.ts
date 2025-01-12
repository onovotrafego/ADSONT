import { supabase } from "./supabase";

const CLICKUP_API_KEY = import.meta.env.VITE_CLICKUP_API_KEY;
const CLICKUP_LIST_ID = import.meta.env.VITE_CLICKUP_LIST_ID;

type ClickUpTask = {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  date_created: string;
  date_updated: string;
  comments: Array<{
    comment_text: string;
    date: string;
  }>;
};

export async function testClickUpConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}`,
      {
        headers: {
          Authorization: `pk_${CLICKUP_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: `ClickUp API Error: ${error.err || "Unknown error"}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully connected to ClickUp list: ${data.name}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function createCampaignTask(
  campaignData: any,
  clientId: string,
): Promise<string> {
  try {
    const taskData = {
      name: `[${campaignData.productDetails.category}] ${campaignData.title || "New Campaign"}`,
      description: `# Campaign Details

## Product Information
- **Category:** ${campaignData.productDetails.category}

## Campaign Objectives
- **Target Audience:** ${campaignData.campaignObjectives.targetAudience}
- **Budget:** $${campaignData.campaignObjectives.budget}
- **Objective:** ${campaignData.campaignObjectives.objective}

## Product Images
${campaignData.images
  .map(
    (img: any, index: number) =>
      `### Image ${index + 1}
- **URL:** ${img.preview}
- **Description:** ${img.description}`,
  )
  .join("\n\n")}`,
      status: "SOLICITAÇÃO",
      markdown_description: true,
    };

    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`,
      {
        method: "POST",
        headers: {
          Authorization: `pk_${CLICKUP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ClickUp API Error: ${error.err || "Unknown error"}`);
    }

    const data = await response.json();

    // Store the client-campaign relationship in Supabase
    const { error: supabaseError } = await supabase
      .from("campaign_clients")
      .insert({
        client_id: clientId,
        clickup_task_id: data.id,
      });

    if (supabaseError) {
      throw new Error(`Supabase Error: ${supabaseError.message}`);
    }

    return data.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function getCampaignTasks(
  clientId?: string,
): Promise<ClickUpTask[]> {
  // First, get all tasks from ClickUp
  const response = await fetch(
    `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`,
    {
      headers: {
        Authorization: `pk_${CLICKUP_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ClickUp API Error: ${error.err || "Unknown error"}`);
  }

  const data = await response.json();
  const allTasks = data.tasks || [];

  // If no clientId is provided, return all tasks
  if (!clientId) {
    return allTasks;
  }

  // Get the campaign IDs associated with this client from Supabase
  const { data: clientCampaigns, error } = await supabase
    .from("campaign_clients")
    .select("clickup_task_id")
    .eq("client_id", clientId);

  if (error) {
    throw new Error(`Supabase Error: ${error.message}`);
  }

  // Filter tasks to only include those associated with the client
  const clientTaskIds = new Set(
    clientCampaigns.map((cc) => cc.clickup_task_id),
  );
  return allTasks.filter((task) => clientTaskIds.has(task.id));
}

export async function getTaskUpdates(taskId: string) {
  const response = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}/comment`,
    {
      headers: {
        Authorization: `pk_${CLICKUP_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ClickUp API Error: ${error.err || "Unknown error"}`);
  }

  const data = await response.json();
  return data.comments || [];
}

export async function getClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(`Supabase Error: ${error.message}`);
  }

  return data || [];
}
