import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type ReviewProps = {
  onBack: () => void;
  onSubmit: () => void;
  formData: {
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
  };
};

export default function Review({ onBack, onSubmit, formData }: ReviewProps) {
  const objectiveLabels = {
    awareness: "Brand Awareness",
    traffic: "Website Traffic",
    engagement: "Post Engagement",
    leads: "Lead Generation",
    sales: "Sales",
  };

  const categoryLabels = {
    electronics: "Electronics",
    fashion: "Fashion",
    home: "Home & Living",
    beauty: "Beauty & Personal Care",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Review Campaign</h2>
        <p className="text-muted-foreground">
          Review all information before submitting
        </p>
      </div>

      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="space-y-6">
          <section>
            <h3 className="font-semibold">Product Details</h3>
            <Separator className="my-2" />
            <p>
              <span className="text-muted-foreground">Category:</span>{" "}
              {
                categoryLabels[
                  formData.productDetails
                    .category as keyof typeof categoryLabels
                ]
              }
            </p>
          </section>

          <section>
            <h3 className="font-semibold">Campaign Objectives</h3>
            <Separator className="my-2" />
            <div className="space-y-2">
              <p>
                <span className="text-muted-foreground">Objective:</span>{" "}
                {
                  objectiveLabels[
                    formData.campaignObjectives
                      .objective as keyof typeof objectiveLabels
                  ]
                }
              </p>
              <p>
                <span className="text-muted-foreground">Target Audience:</span>{" "}
                {formData.campaignObjectives.targetAudience}
              </p>
              <p>
                <span className="text-muted-foreground">Budget:</span> $
                {formData.campaignObjectives.budget}
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-semibold">Campaign Images</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 gap-4">
              {formData.images.map((image, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <img
                      src={image.preview}
                      alt={`Campaign image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Description:
                      </p>
                      <p className="mt-1">{image.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button onClick={onSubmit} className="flex-1">
          Submit Campaign
        </Button>
      </div>
    </div>
  );
}
