"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/LandingPage/form";
import { RegisterSchema } from "@/schemas";
import { Input } from "@/components/ui/LandingPage/input";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { register } from "@/actions/register";
import toast from "react-hot-toast";
import Link from "next/link";

// Demo credentials
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";

export default function Page() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    startTransition(() => {
      register(values).then((data) => {
        if (data?.error) {
          toast.error(data.error);
        }
        if (data?.success) {
          toast.success(data.success);
          form.reset({ email: "", password: "", name: "" });
        }
      });
    });
  };

  return (
    <CardWrapper
      headerTitle="Register"
      backButtonLabel="Already have an account?"
      backButtonHref="/login"
      showSocial
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 text-sm">
        <p className="font-medium mb-1">Demo Mode Active</p>
        <p>Registration is disabled in demo mode.</p>
        <p>Please use the demo account instead:</p>
        <p>Email: {DEMO_EMAIL}</p>
        <p>Password: {DEMO_PASSWORD}</p>
        <Button className="w-full mt-2" size="sm" asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-1 w-full"
        >
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Tyler Durden"
                      disabled={true}
                      type="name"
                      className="bg-background/50 dark:bg-background/30 ring-foreground/5"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
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
                      {...field}
                      placeholder="tylerdurden@gmail.com"
                      disabled={true}
                      type="email"
                      className="bg-background/50 dark:bg-background/30 ring-foreground/5"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
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
                      {...field}
                      placeholder="••••••••"
                      disabled={true}
                      type="password"
                      className="bg-background/50 dark:bg-background/30 ring-foreground/5"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 " />
                </FormItem>
              )}
            />
            <div></div>
          </div>
          <Button className="w-full" disabled={true} type="submit">
            Registration Disabled
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
