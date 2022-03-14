const endPointURL = "http://localhost:9000/graphql";

export async function loadJobs() {
  const query = `
  {
    jobs {
      id,
      title,
      company {
        id,
        name,
      },
    }
  }  
  `;

  const data = await graphqlRequest(query);
  return data.jobs;
}

export async function loadJob(id) {
  const query = `
  query JobQuery($id: ID!){
    job(id: $id) {
      id,
      title,
      company {
        id,
        name
      },
      description
    }
  }            
  `;
  const data = await graphqlRequest(query, { id });
  return data.job;
}

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(endPointURL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (body.errors) {
    const message = body.errors.map((error) => error.message).join("\n");
    throw new Error(message);
  }
  return body.data;
}
