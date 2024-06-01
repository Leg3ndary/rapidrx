import OpenAI from 'openai';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// const AUTH_HEADER = request.headers.get('X-Custom-Auth');
		// if (!AUTH_HEADER || AUTH_HEADER !== env.AUTH_KEY) {
		// 	return Response.json({ status: 403, message: 'Forbidden' }, { status: 403 });
		// }

		try {
			const openai = new OpenAI({
				apiKey: env.OPENAI_API_KEY,
			});
			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: 'Say ax' }],
				max_tokens: 1,
			});

			if (response && response.choices && response.choices.length > 0) {
				const message = response.choices[0].message.content;
				return Response.json({ text: message }, { status: 200 });
			} else {
				return Response.json({ status: 500, message: 'No response from OpenAI' }, { status: 500 });
			}
		} catch (error) {
			console.error('Error:', error);
			return Response.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
		}
	},
};
