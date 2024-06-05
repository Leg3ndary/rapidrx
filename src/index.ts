import OpenAI from "openai";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, X-Custom-Auth",
		};

		if (request.method === "OPTIONS") {
			// Handle CORS preflight requests
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		const AUTH_HEADER = request.headers.get("X-Custom-Auth");
		if (!AUTH_HEADER || AUTH_HEADER !== env.AUTH_KEY) {
			return Response.json(
				{ status: 403, message: "Forbidden" },
				{
					status: 403,
					headers: corsHeaders,
				},
			);
		}

		const url = new URL(request.url);
		const param = url.searchParams.get("diagnosis");
		if (!param) {
			return Response.json(
				{ status: 400, message: "Bad Request" },
				{
					status: 400,
					headers: corsHeaders,
				},
			);
		}

		try {
			const openai = new OpenAI({
				apiKey: env.OPENAI_API_KEY,
			});
			const response = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{
						role: "user",
						content: `Generate a JSON response only without any other text that includes 3 objects, do not include any newlines or backslashes, the first with a key of overTheCounter should have one over the counter medication that can treat ${param}. The next object should have a key of homeopathy, and provide a homeopathy treatment for the same diagnosis, and the last object should have a key of home and provide a home remedy for the same diagnosis. Each object should then have a "title" key, representing the medication, a "description" key, and a "sideEffects" key. Finally include another key value pair with the key being "diagnosis", and the value being another object with a description about the diagnosis under the key "description", and a "symptoms" key with an list of symptoms, make sure this is a string and not an array.`,
					},
				],
			});

			if (response && response.choices && response.choices.length > 0) {
				const message = response.choices[0].message.content;
				const json = JSON.parse(message || "");
				return Response.json(json, {
					status: 200,
					headers: corsHeaders,
				});
			} else {
				return Response.json(
					{ status: 500, message: "No response from OpenAI" },
					{
						status: 500,
						headers: corsHeaders,
					},
				);
			}
		} catch (error) {
			console.error("Error:", error);
			return Response.json(
				{ status: 500, message: "Internal Server Error" },
				{
					status: 500,
					headers: corsHeaders,
				},
			);
		}
	},
};
