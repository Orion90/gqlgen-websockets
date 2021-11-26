<script context="module">
	import { get, readable } from 'svelte/store';
	import {
		createClient,
		operationStore,
		setClient,
		defaultExchanges,
		subscriptionExchange,
		fetchExchange
	} from '@urql/svelte';
	import { browser } from '$app/env';
	import { createClient as createWSClient } from 'graphql-ws';
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ fetch, stuff }) {
		let client = await createClient({
			url: 'http://localhost:8333/query'
		});

		if (browser) {
			const wsClient = createWSClient({
				url: 'ws://localhost:8333/query'
			});
			client = createClient({
				url: 'ws://localhost:8333/query',
				exchanges: [
					subscriptionExchange({
						forwardSubscription(operation) {
							return {
								subscribe: (sink) => {
									const dispose = wsClient.subscribe(operation, sink);
									return {
										unsubscribe: dispose
									};
								}
							};
						}
					})
				]
			});
		}
		return {
			stuff: {
				...stuff,
				client,
				// Works just like query from @urql/svelte
				query: async (query, variables, context, normalize) => {
					const store = operationStore(query, variables, context);

					console.log('1');
					console.log(client);
					const result = await client
						.query(store.query, store.variables, store.context)
						.toPromise();
					console.log('2');
					Object.assign(get(store), result);
					// Allow to access deep nested object directly at data
					if (normalize) {
						const { subscribe } = store;
						return Object.create(store, {
							subscribe: {
								enumerable: true,
								value: readable(store, (set) => {
									const unsubscribe = subscribe((result) => {
										if (result.data) {
											Object.assign(result.data, normalize(result.data, result));
										}
										set(result);
									});
									return unsubscribe;
								}).subscribe
							}
						});
					}
					return store;
				}
			},
			props: { client }
		};
	}
</script>

<script lang="ts">
	import '../app.css';
	export let client;
	if (browser) {
		console.log(client);
		setClient(client);
	}
</script>

<main>
	<div class="mx-auto py-8">
		<slot />
	</div>
</main>
