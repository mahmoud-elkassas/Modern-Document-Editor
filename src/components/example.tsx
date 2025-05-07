import { useToast } from "@/hooks/use-toast";

export function ExampleComponent() {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
      variant: "default", // or "destructive"
    });
  };

  return <button onClick={showToast}>Show Toast</button>;
}
