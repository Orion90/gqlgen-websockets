const ws = require('ws'); // yarn add ws
const Crypto = require('crypto');
const { createClient } = require('graphql-ws');

const client = createClient({
  url: 'ws://localhost:8080/query',
  webSocketImpl: ws,
  /**
   * Generates a v4 UUID to be used as the ID.
   * Reference: https://gist.github.com/jed/982883
   */
  generateID: () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (Crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16),
    ),
});


// query
const get = async () => {
  const result = await new Promise((resolve, reject) => {
    let result;
    client.subscribe(
      {
        query: '{ hello }',
      },
      {
        next: (data) => (result = data),
        error: (data) => {
          console.log(data)
        },
        complete: () => resolve(result),
      },
    );
  });

  return result
}

const rest = get().then(d => {
  console.log(d)
})