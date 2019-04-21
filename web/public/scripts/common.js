export function timeout(promise, timeoutDuration) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutDuration);

    promise
      .then(resolve)
      .catch(reject);
  });
}

export async function resolveResponse(responsePromise) {
  const response = await responsePromise;
  if (response.status >= 400)
    throw Error(response.statusText);

  return response;
}

export async function parseResponseAsJson(responsePromise) {
  const response = await resolveResponse(responsePromise);
  return await response.json();
}
