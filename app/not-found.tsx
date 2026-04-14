import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-[10rem])] text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="rounded-full bg-muted p-6 mb-6">
          <SearchX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground text-lg mb-8 max-w-[500px]">
        We couldn't find the page you're looking for. It seems the job you were hunting might not exist anymore!
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full px-8 shadow-md">
          Return Home
        </Button>
      </Link>
    </div>
  )
}
