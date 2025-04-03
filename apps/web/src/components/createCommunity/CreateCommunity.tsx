"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { FaSpinner } from "react-icons/fa6";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@repo/ui/components/ui/textarea";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z
    .instanceof(File, {
      message: "Please select an image file.",
    })
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: `The image is too large. Please choose an image smaller than 5MB.`,
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Please upload a valid image file (JPEG, PNG, or WebP).",
    })
    .refine(
      (file) =>
        new Promise((resolve) => {
          if (!file) {
            resolve(true); // Skip validation if no file is uploaded
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const meetsDimensions =
                img.width >= MIN_DIMENSIONS.width &&
                img.height >= MIN_DIMENSIONS.height &&
                img.width <= MAX_DIMENSIONS.width &&
                img.height <= MAX_DIMENSIONS.height;
              resolve(meetsDimensions);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }),
      {
        message: `The image dimensions are invalid. Please upload an image between ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} and ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`,
      }
    ),
});

const CreateCommunity = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isLoading } = useApi("/communities", {
    method: "POST",
    onSuccess: (data) => {
      // console.log(data);
      toast.success("Community has been successfully created", {
        description: `Let's move to the community`,
      });
    },
    onError: (error) => {
      toast.error("Community not created", {
        description: error.message,
      });
      // console.error(error);
    },
  });

  async function onSubmit(val: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData(); // Create formData inside the function
      formData.append("name", val.name);
      formData.append("description", val.description);
      if (val.image) {
        formData.append("image", val.image);
      }

      await mutate({
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/explore"); //change this after creating communitites page
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="relative flex-1 mt-10">
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 w-full">
        <h2 className="bg-gradient-to-r from-primary to-secondary-7 text-primary-foreground md:text-xl text-lg md:font-medium font-normal tracking-wide lg:py-4 py-3 rounded-t-lg px-6 shadow-md shadow-primary-1">
          Community Creation
        </h2>
      </div>
      <Card className="shadow-md shadow-primary-1 mt-6 p-0 overflow-hidden">
        <CardContent className="lg:p-4 lg:pt-8 p-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col md:pt-2 pt-12 pb-3 px-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XeniaOG"
                        {...field}
                        className="bg-primary-1/20 rounded-lg placeholder:opacity-50"
                      />
                    </FormControl>
                    <FormDescription className="hidden md:block">
                      This is the public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=""
                        {...field}
                        className="bg-primary-1/20 rounded-lg placeholder:opacity-50"
                        autoComplete="on"
                      />
                    </FormControl>
                    <FormDescription className="hidden md:block">
                      Tell us about your community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel htmlFor="picture">Upload Image</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-primary-1/20 rounded-lg"
                        type="file"
                        id="picture"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => {
                          onChange(e.target.files?.item(0));
                        }}
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription className="text-sm md:text-base">
                      Upload an image file (max 5MB). Supported formats: JPG,
                      PNG, WebP.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant={"gradient"}
                className="self-center py-6 px-5 shadow-lg shadow-primary-1"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin text-xl" />
                ) : (
                  "Create"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCommunity;
