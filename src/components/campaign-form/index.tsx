import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createCampaignTask, getClients } from "@/lib/clickup";
import ProductDetails from "./steps/product-details";
import CampaignObjectives from "./steps/campaign-objectives";
import ImageUpload from "./steps/image-upload";
import Review from "./steps/review";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Step =
  | "product-details"
  | "campaign-objectives"
  | "image-upload"
  | "review";

type FormData = {
  productDetails: {
    category: string;
  };
  campaignObjectives: {
    objective: string;
    targetAudience: string;
    budget: string;
  };
  images: Array<{
    preview: string;
    description: string;
  }>;
  clientId?: string;
};

type Client = {
  id: string;
  name: string;
  company: string;
};

export default function CampaignForm() {
  const [currentStep, setCurrentStep] = useState<Step>("product-details");
  const [formData, setFormData] = useState<FormData>({
    productDetails: {
      category: "",
    },
    campaignObjectives: {
      objective: "",
      targetAudience: "",
      budget: "",
    },
    images: [],
  });
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function loadClients() {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Error loading clients:", error);
        toast({
          title: "Error loading clients",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    }
    loadClients();
  }, [toast]);

  const handleProductDetailsSubmit = (data: { category: string }) => {
    setFormData((prev) => ({
      ...prev,
      productDetails: data,
    }));
    setCurrentStep("campaign-objectives");
  };

  const handleCampaignObjectivesSubmit = (data: {
    objective: string;
    targetAudience: string;
    budget: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      campaignObjectives: data,
    }));
    setCurrentStep("image-upload");
  };

  const handleImageUploadSubmit = (
    images: Array<{ preview: string; description: string }>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }));
    setCurrentStep("review");
  };

  const handleFinalSubmit = async () => {
    if (!formData.clientId) {
      toast({
        title: "Please select a client",
        description: "A client must be selected before submitting the campaign",
        variant: "destructive",
      });
      return;
    }

    try {
      const campaignData = {
        title: `${formData.productDetails.category} Campaign`,
        ...formData,
      };

      await createCampaignTask(campaignData, formData.clientId);

      toast({
        title: "Campaign submitted successfully",
        description:
          "You can track its progress in the Campaign Progress section",
      });

      navigate("/progress");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error submitting campaign",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Campaign Request</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to submit your campaign request
        </p>
      </div>

      <Card className="p-6">
        {currentStep === "review" && (
          <div className="mb-6">
            <Label htmlFor="client">Select Client</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, clientId: value }))
              }
            >
              <SelectTrigger id="client">
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
          </div>
        )}

        {currentStep === "product-details" && (
          <ProductDetails onNext={handleProductDetailsSubmit} />
        )}
        {currentStep === "campaign-objectives" && (
          <CampaignObjectives
            onNext={handleCampaignObjectivesSubmit}
            onBack={() => setCurrentStep("product-details")}
          />
        )}
        {currentStep === "image-upload" && (
          <ImageUpload
            onBack={() => setCurrentStep("campaign-objectives")}
            onSubmit={handleImageUploadSubmit}
          />
        )}
        {currentStep === "review" && (
          <Review
            formData={formData}
            onBack={() => setCurrentStep("image-upload")}
            onSubmit={handleFinalSubmit}
          />
        )}
      </Card>
    </div>
  );
}
