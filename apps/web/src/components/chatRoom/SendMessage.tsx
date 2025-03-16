"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { RiSendPlaneFill } from "react-icons/ri";
import { Smile } from "lucide-react";

interface msg {
  sender: string;
  content: string;
}

interface chat {
  chats: msg[];
}

const formSchema = z.object({
  chatmsg: z.string(),
});

const SendMessage = ({
  msgs,
  setMsgs,
}: {
  msgs: chat;
  setMsgs: React.Dispatch<React.SetStateAction<chat>>;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatmsg: "",
    },
  });

  const addMessage = (sender: string, content: string) => {
    setMsgs((prev) => ({
      ...prev,
      chats: [...prev.chats, { sender, content }],
    }));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    addMessage("Elsa", values.chatmsg);
    form.reset();
  }
  return (
    <div className="flex w-full px-6 py-4 bg-white gap-2 items-center flex-shrink-0">
      <Smile className="text-indigo-950" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full items-center gap-2"
        >
          <FormField
            control={form.control}
            name="chatmsg"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Type your message"
                    className="bg-chatroom-accent/10 rounded-xl flex-1"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            className="bg-violet-500/80 px-2.5 rounded-xl text-white"
            type="submit"
          >
            <RiSendPlaneFill className="text-xl" />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SendMessage;
