interface AddUserBody {
	clerk_user_id: string;
	email: string;
	role?: "admin" | "hr" | "employee";
}

interface ContactBody {
	name: string;
	email: string;
	message: string;
}

interface Env {
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { DB } = env;
		const url = new URL(request.url);
		const path = url.pathname.replace(/\/+$/, "");

		// ✅ CORS
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// 🔐 SIMPLE AUTH (temporary)
			const authHeader = request.headers.get("authorization");

			const isProtectedRoute =
				path === "/stats" || path === "/users" || path === "/employees";

			if (isProtectedRoute) {
				if (authHeader !== "Bearer my-secret-key") {
					return new Response("Unauthorized", { status: 401 });
				}
			}

			// =========================
			// ✅ STATS (PROTECTED)
			// =========================
			if (path === "/stats" && request.method === "GET") {
				const users = await DB.prepare("SELECT COUNT(*) as count FROM users").first();
				const employees = await DB.prepare("SELECT COUNT(*) as count FROM employees").first();
				const messages = await DB.prepare("SELECT COUNT(*) as count FROM contact_messages").first();

				return new Response(
					JSON.stringify({
						users: users?.count || 0,
						employees: employees?.count || 0,
						messages: messages?.count || 0,
					}),
					{
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					}
				);
			}

			// =========================
			// ✅ GET USERS (PROTECTED)
			// =========================
			if (path === "/users" && request.method === "GET") {
				const result = await DB.prepare("SELECT * FROM users").all();
				return new Response(JSON.stringify(result.results), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			// =========================
			// ✅ ADD USER
			// =========================
			if (path === "/add-user" && request.method === "POST") {
				const body = (await request.json()) as AddUserBody;

				await DB.prepare(
					"INSERT INTO users (clerk_user_id, email, role) VALUES (?, ?, ?)"
				)
					.bind(body.clerk_user_id, body.email, body.role || "employee")
					.run();

				return new Response(JSON.stringify({ success: true }), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			// =========================
			// ✅ GET EMPLOYEES (PROTECTED)
			// =========================
			if (path === "/employees" && request.method === "GET") {
				const result = await DB.prepare("SELECT * FROM employees").all();
				return new Response(JSON.stringify(result.results), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			// =========================
			// ✅ CONTACT (PUBLIC)
			// =========================
			if (path === "/contact" && request.method === "POST") {
				const body = (await request.json()) as ContactBody;

				await DB.prepare(
					"INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)"
				)
					.bind(body.name, body.email, body.message)
					.run();

				return new Response(JSON.stringify({ success: true }), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			// =========================
			// ❌ NOT FOUND
			// =========================
			return new Response("Not Found", {
				status: 404,
				headers: corsHeaders,
			});

		} catch (error) {
			console.error("Worker Error:", error);

			return new Response(JSON.stringify({ error: "Internal Server Error" }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
	},
};