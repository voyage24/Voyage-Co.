import { prisma } from "@/lib/prisma";
import SetupForm from "@/components/admin/SetupForm";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const alreadySetUp = (await prisma.adminUser.count()) > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {alreadySetUp ? (
        <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center space-y-3">
          <h1 className="text-xl font-semibold text-gray-900">Setup already completed</h1>
          <p className="text-sm text-gray-600">An admin account already exists.</p>
          <a href="/admin/login" className="inline-block mt-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
            Go to login
          </a>
        </div>
      ) : (
        <SetupForm />
      )}
    </div>
  );
}
