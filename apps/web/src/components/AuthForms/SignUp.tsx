"use client";
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

const formSchema = z
  .object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const { mutate, error, isLoading } = useApi("/user/signup", {
    method: "POST",
    onSuccess: (data) => {
      // console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutate({
      body: {
        name: values.username,
        email: values.email,
        password: values.password,
      },
    });
  }

  return (
    <Card className="p-1 lg:p-2 lg:mx-24 mx-2 lg:my-8 mt-6 mb-10 text-primary-9 shadow-md shadow-primary-1">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col pt-8 pb-1"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="xenia@connect.com"
                      {...field}
                      className="bg-primary-1/20 rounded-lg placeholder:opacity-50"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a valid email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      className="bg-primary-1/20 rounded-lg placeholder:opacity-50"
                      type="password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      className="bg-primary-1/20 rounded-lg placeholder:opacity-50"
                      type="password"
                      autoComplete="on"
                    />
                  </FormControl>
                  <FormDescription>
                    Please confirm your password.
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
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SignUp;
