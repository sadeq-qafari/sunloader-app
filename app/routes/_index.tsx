import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  const apiBase = context.cloudflare.API_BASE;
  const res = await fetch(`https://sunloader.hozoorban.ir/downloads`);
  const jsonData:any = await res.json();
  return json({ downloads: jsonData.result ?? [] });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const apiBase = context.cloudflare.API_BASE;
  const form = await request.formData();
  const url = form.get("url")?.toString();

  if (url) {
    await fetch(`https://sunloader.hozoorban.ir/downloads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  }

  return redirect("/");
}

export default function DownloadsPage() {
  const { downloads } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Downloads</h1>

        {/* Add Form */}
        <Form method="post" className="flex gap-4 items-center">
          <input
            name="url"
            type="url"
            placeholder="Paste download URL..."
            required
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </Form>

        {/* Reload Button */}
        <Form method="get">
          <button
            type="submit"
            className="text-sm text-blue-500 hover:underline"
          >
            🔄 Reload
          </button>
        </Form>

        {/* Downloads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">File</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Progress</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((d: any, i: number) => (
                <tr key={d.id ?? i} className="border-t">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">
                    <div className="w-96 overflow-hidden" >{d.file ?? d.url}</div>
                  </td>
                  <td className="p-2 border">{d.status ?? "queued"}</td>
                  <td className="p-2 border">{d.progress}</td>
                </tr>
              ))}
              {downloads.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">
                    No downloads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
