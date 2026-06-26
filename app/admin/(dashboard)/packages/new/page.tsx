import PackageForm from "@/components/admin/PackageForm";

export default function NewPackagePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add Package</h1>
      <PackageForm />
    </div>
  );
}
