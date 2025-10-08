import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">LifeUp</h1>
          <p className="text-muted-foreground">
            Clean Architecture with NestJS + Next.js + Tailwind 4 + shadcn/ui
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Backend (NestJS)</CardTitle>
              <CardDescription>
                Onion Architecture with TypeScript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Domain Layer (Entities, Repositories)</li>
                <li>✓ Application Layer (Use Cases, DTOs)</li>
                <li>✓ Infrastructure Layer (Prisma, Database)</li>
                <li>✓ Presentation Layer (Controllers)</li>
                <li>✓ Zod for validation</li>
                <li>✓ PostgreSQL with Prisma ORM</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frontend (Next.js)</CardTitle>
              <CardDescription>
                Modern React with Tailwind CSS 4
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Next.js 15 with App Router</li>
                <li>✓ TypeScript strict mode</li>
                <li>✓ Tailwind CSS 4</li>
                <li>✓ shadcn/ui components</li>
                <li>✓ Type-safe API client</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Quick start guide for development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Backend Setup:</h3>
                <code className="block bg-muted p-3 rounded text-sm">
                  cd backend<br />
                  npm run prisma:generate<br />
                  npm run start:dev
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Frontend Setup:</h3>
                <code className="block bg-muted p-3 rounded text-sm">
                  cd frontend<br />
                  npm run dev
                </code>
              </div>
              <Button className="w-full sm:w-auto">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
