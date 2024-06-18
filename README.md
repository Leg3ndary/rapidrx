# RapidRx Worker

This is a worker for the RapidRx project. It is responsible for processing data and then returning it in a suitable format.

This project uses cloudflare workers and the OpenAI API to run and parse/format data into a readable and usable format.

## Installation

Clone the repository and run `npm install` to install the dependencies.

Add the OPEN_API_KEY and AUTH_KEY to the .dev.vars file:

```env
OPEN_API_KEY="your_open_api_key"
AUTH_KEY="your_auth_key"
```


## Usage

To run the worker, you need to have wrangler installed. You can install it by running `npm install -g @cloudflare/wrangler`.

After installing wrangler, you need to login to your cloudflare account by running `wrangler login`.

Then you can run the worker by running `wrangler dev`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Testing

Simply run `npm test` to run the full tests.
