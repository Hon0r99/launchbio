import { PageForm } from "@/components/page-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Create page | LaunchBio",
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create your launch page</h1>
        <p className="text-white/70">
          Fill the form and get two URLs: a public link and a secret edit link.
        </p>
      </div>
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <PageForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

