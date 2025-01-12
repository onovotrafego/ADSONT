import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

type ImageUploadProps = {
  onBack: () => void;
  onSubmit: (images: Array<{ preview: string; description: string }>) => void;
};

type PreviewFile = {
  file: File;
  preview: string;
  id: string;
};

const formSchema = z.object({
  descriptions: z.record(
    z.string().min(10, "Description must be at least 10 characters"),
  ),
});

export default function ImageUpload({ onBack, onSubmit }: ImageUploadProps) {
  const [files, setFiles] = useState<PreviewFile[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descriptions: {},
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (fileToRemove: PreviewFile) => {
    URL.revokeObjectURL(fileToRemove.preview);
    setFiles((files) => files.filter((f) => f !== fileToRemove));
    const { descriptions } = form.getValues();
    delete descriptions[fileToRemove.id];
    form.setValue("descriptions", descriptions);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: true,
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const imagesWithDescriptions = files.map((file) => ({
      preview: file.preview,
      description: values.descriptions[file.id],
    }));
    onSubmit(imagesWithDescriptions);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Upload Campaign Images</h2>
        <p className="text-muted-foreground">
          Add images and describe each product
        </p>
      </div>

      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <div className="space-y-2">
            <p>Drag & drop images here, or click to select files</p>
            <p className="text-sm text-muted-foreground">
              Supported formats: JPEG, PNG
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              {files.map((file) => (
                <div key={file.id} className="space-y-4">
                  <div className="relative">
                    <img
                      src={file.preview}
                      alt={`Preview ${file.id}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`descriptions.${file.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the product in this image (e.g., name, features, specifications)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Next Step
              </Button>
            </div>
          </form>
        </Form>
      )}

      {files.length === 0 && (
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button disabled className="flex-1">
            Next Step
          </Button>
        </div>
      )}
    </div>
  );
}
