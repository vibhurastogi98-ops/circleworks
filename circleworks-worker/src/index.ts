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

		// ✅ FIX: normalize path (trailing slash issue)
		const path = url.pathname.replace(/\/+$/, "");

		console.log("PATH:", path);

		// ✅ CORS HEADERS
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		// ✅ Handle preflight request
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// ✅ GET USERS
		if (path === "/users" && request.method === "GET") {
			const result = await DB.prepare("SELECT * FROM users").all();
			return new Response(JSON.stringify(result.results), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// ✅ ADD USER
		if (path === "/add-user" && request.method === "POST") {
			try {
				const body = (await request.json()) as AddUserBody;

				await DB.prepare(
					"INSERT INTO users (clerk_user_id, email, role) VALUES (?, ?, ?)"
				)
					.bind(body.clerk_user_id, body.email, body.role || "employee")
					.run();

				return new Response(JSON.stringify({ success: true }), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			} catch (error) {
				return new Response(JSON.stringify({ error: "Failed to add user" }), {
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}
		}

		// ✅ GET EMPLOYEES
		if (path === "/employees" && request.method === "GET") {
			const result = await DB.prepare("SELECT * FROM employees").all();
			return new Response(JSON.stringify(result.results), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// ✅ CONTACT FORM SAVE
		if (path === "/contact" && request.method === "POST") {
			try {
				const body = (await request.json()) as ContactBody;

				await DB.prepare(
					"INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)"
				)
					.bind(body.name, body.email, body.message)
					.run();

				return new Response(JSON.stringify({ success: true }), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			} catch (error) {
				return new Response(JSON.stringify({ error: "Failed to save message" }), {
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}
		}

		// ❌ Not Found
		return new Response("Not Found", {
			status: 404,
			headers: corsHeaders,
		});
	},
};