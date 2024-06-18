import { describe, it, expect } from "vitest";
import worker from "../src/index";
import { createExecutionContext, waitOnExecutionContext, env } from "cloudflare:test";

type DiagnosisResponse = {
	overTheCounter: {
		title: string;
		description: string;
		sideEffects: string;
	};
	homeopathy: {
		title: string;
		description: string;
		sideEffects: string;
	};
	home: {
		title: string;
		description: string;
		sideEffects: string;
	};
	prescription: {
		title: string;
		description: string;
		sideEffects: string;
	};
	diagnosis: {
		description: string;
		symptoms: string;
	};
};

describe("Cloudflare Worker", () => {
	it("handles OPTIONS request for CORS", async () => {
		const request = new Request("http://bleg3ndary.workers.dev", { method: "OPTIONS" });
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
		expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, X-Custom-Auth");
	});

	it("rejects unauthorized requests", async () => {
		const request = new Request("http://bleg3ndary.workers.dev?diagnosis=fever", {
			headers: {
				"X-Custom-Auth": "wrong_env.AUTH_KEY",
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(403);
		const jsonResponse = await response.json();
		expect(jsonResponse).toEqual({ status: 403, message: "Forbidden" });
	});

	it("rejects requests missing the diagnosis parameter", async () => {
		const request = new Request("http://bleg3ndary.workers.dev", {
			headers: {
				"X-Custom-Auth": (env as any).AUTH_KEY,
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
		const jsonResponse = await response.json();
		expect(jsonResponse).toEqual({ status: 400, message: "Bad Request" });
	});
	it("processes a valid request correctly", async () => {
		const request = new Request("http://bleg3ndary.workers.dev?diagnosis=fever", {
			headers: {
				"X-Custom-Auth": (env as any).AUTH_KEY,
			},
		});

		const openAiResponse = {
			choices: [
				{
					message: {
						content: JSON.stringify({
							overTheCounter: {
								title: "Paracetamol",
								description: "Paracetamol helps to reduce fever and relieve pain.",
								sideEffects: "Nausea, rash.",
							},
							homeopathy: {
								title: "Belladonna",
								description: "Belladonna is used in homeopathy to treat fever with sudden onset.",
								sideEffects: "Dry mouth, dilated pupils.",
							},
							home: {
								title: "Cold Compress",
								description: "A cold compress can help reduce fever.",
								sideEffects: "Skin irritation.",
							},
							prescription: {
								title: "Ibuprofen",
								description: "Ibuprofen is a prescription medication used to reduce fever and pain.",
								sideEffects: "Stomach pain, dizziness.",
							},
							diagnosis: {
								description: "Fever is a temporary increase in body temperature.",
								symptoms: "High temperature, sweating, chills.",
							},
						}),
					},
				},
			],
		};

		const openai = {
			chat: {
				completions: {
					create: () => Promise.resolve(openAiResponse),
				},
			},
		};

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, { ...env, openai }, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const jsonResponse: DiagnosisResponse = await response.json();
		expect(jsonResponse).toHaveProperty("overTheCounter");
		expect(jsonResponse.overTheCounter).toHaveProperty("title");
		expect(jsonResponse.overTheCounter).toHaveProperty("description");
		expect(jsonResponse.overTheCounter).toHaveProperty("sideEffects");

		expect(jsonResponse).toHaveProperty("homeopathy");
		expect(jsonResponse.homeopathy).toHaveProperty("title");
		expect(jsonResponse.homeopathy).toHaveProperty("description");
		expect(jsonResponse.homeopathy).toHaveProperty("sideEffects");

		expect(jsonResponse).toHaveProperty("home");
		expect(jsonResponse.home).toHaveProperty("title");
		expect(jsonResponse.home).toHaveProperty("description");
		expect(jsonResponse.home).toHaveProperty("sideEffects");

		expect(jsonResponse).toHaveProperty("prescription");
		expect(jsonResponse.prescription).toHaveProperty("title");
		expect(jsonResponse.prescription).toHaveProperty("description");
		expect(jsonResponse.prescription).toHaveProperty("sideEffects");

		expect(jsonResponse).toHaveProperty("diagnosis");
		expect(jsonResponse.diagnosis).toHaveProperty("description");
		expect(jsonResponse.diagnosis).toHaveProperty("symptoms");
	}, 30000);
});
