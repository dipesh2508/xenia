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
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { FaSpinner } from "react-icons/fa6";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const formData = new FormData();

  const { mutate } = useApi("/communities", {
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
      formData.append("name", val.name);
      formData.append("description", val.description);
      if (val.image) {
        formData.append("image", val.image);
      }

      await mutate({
        body: formData,
      });

      router.push("/"); //change this after creating communitites page
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Card className="p-1 lg:p-2 lg:mx-48 mx-2 lg:my-8 mt-6 mb-10 text-primary-9 shadow-md shadow-primary-1">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col pt-8 pb-1"
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
                  <FormDescription>
                    This is your public display name.
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
                    <Input
                      placeholder=""
                      {...field}
                      className="bg-primary-1/20 rounded-lg placeholder:opacity-50"
                      type="text"
                      autoComplete="on"
                    />
                  </FormControl>
                  <FormDescription>Let&apos;s add security.</FormDescription>
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
                  <FormDescription>
                    Upload an image file (max 5MB). Supported formats: JPG, PNG,
                    WebP.
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
              {/* {isLoading ? ( */}
              {/* <FaSpinner className="animate-spin text-xl" />
              ) : ( */}
              Create
              {/* )} */}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateCommunity;
