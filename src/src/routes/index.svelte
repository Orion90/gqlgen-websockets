<script context="module">
	export async function load({ stuff, page }) {
		return {
			props: {
				todos: await stuff.query(
					`query { hello }`,
					{},
					{
						additionalTypenames: [
							/* ... */
						]
					},
					// Result merged in to data -> todos.data.todos
					(data) => data.hello
				),
				bye: await stuff.query(
					`query {bye}`,
					{},
					{
						additionalTypeNames: []
					},
					(data) => data.bye
				)
			}
		};
	}
</script>

<script lang="ts">
	export let todos;
	export let bye;
	$: console.log(todos.data.hello);
</script>

<div class="">
	{#if $todos.fetching}
		<p>Loading...</p>
	{:else if $todos.error}
		<p>Oh no... {$todos.error.message}</p>
	{:else}
		<h2>{$todos.data.hello}</h2>
	{/if}
	<button
		on:click|preventDefault={() => {
			todos.reexecute();
		}}
		class="px-2 mr-2 bg-blue-500 text-white rounded-md">Hello</button
	>
	<button
		on:click|preventDefault={() => {
			bye.reexecute();
		}}
		class="px-2 mr-2 bg-blue-500 text-white rounded-md">Bye</button
	>
</div>
