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
import { FaEye } from "react-icons/fa6";
import { useState } from "react";
import { FaEyeSlash } from "react-icons/fa6";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const SignIn = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="p-2 mx-24 my-10 text-primary-9 shadow-md shadow-primary-1">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex flex-col pt-8 pb-1"
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
                      className="bg-primary-1/20 rounded-lg"
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
                      className="bg-primary-1/20 rounded-lg"
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
                    <div className="relative">
                      <div className="absolute right-2.5 top-3 h-4 w-4">
                        {showPassword ? (
                          <FaEyeSlash
                            className="h-4 w-4 text-secondary-4 transition cursor-pointer duration-75"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <FaEye
                            className="h-4 w-4 text-secondary-4 transition cursor-pointer duration-75"
                            onClick={() => setShowPassword(true)}
                          />
                        )}
                      </div>
                      <Input
                        placeholder=""
                        {...field}
                        className="bg-primary-1/20 rounded-lg w-full pr-8"
                        type={showPassword ? "text" : "password"}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Let&apos;s add security.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant={"gradient"}
              className="self-center py-6 px-5 shadow-lg shadow-primary-1"
            >
              Let&apos;s Go!
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SignIn;
