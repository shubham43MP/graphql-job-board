import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from "apollo-boost";
import gql from "graphql-tag";
const { getAccessToken, isLoggedIn } = require("./auth");

const endPointURL = "http://localhost:9000/graphql";

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    // request.headers["authorization"] = "Bearer " + getAccessToken();
    operation.setContext({
      headers: {
        authorization: "Bearer " + getAccessToken(),
      },
    });
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: endPointURL })]),
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description
  }
`;

const jobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input)
  }
`;

const companyQuery = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

const jobsQuery = gql`
  query JobsQuery {
    jobs {
      id
      title
      company {
        id
        name
      }
    }
  }
`;

export async function loadJobs() {
  const {
    data: { jobs },
  } = await client.query({ query: jobsQuery });
  return jobs;
}

export async function loadJob(id) {
  const {
    data: { job },
  } = await client.query({ query: jobQuery, variables: { id } });
  return job;
}

export async function loadCompany(id) {
  const {
    data: { company },
  } = await client.query({ query: companyQuery, variables: { id } });
  return company;
}

export async function createJob(input) {
  const {
    data: { job },
  } = await client.mutate({
    mutation: createJobMutation,
    variables: { input },
    // UPDATE UTATION RESULT IN CATCHETO LOAD JOB
    // update: (cache, mutationResult) => {
    //   console.log("mutationaas", mutationResult);
    //   cache.writeQuery({ query: jobQuery, data: mutationResult.data, variables: { id: mutationResult.data.job.id } });
    // },
  });
  return job;
}
