import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';
import { getAccessToken, isLoggedIn } from './auth.js';

const endpointURL = 'http://localhost:9000/graphql';

const authLink = new ApolloLink((operation, forward)=>{
    if (isLoggedIn()) {
        operation.setContext({
            headers: {
                'authorization': 'Bearer ' + getAccessToken()
            }
        });
    };
    return forward(operation);
})

const client = new ApolloClient({
    link: ApolloLink.from([
        authLink,
        new HttpLink({uri: endpointURL})
    ]),
    cache: new InMemoryCache()
});

// async function graphqlRequest(query, variables={}){
//     const request = {
//         method: 'POST',
//         headers: { 'content-type': 'application/json' },
//         body: JSON.stringify({ query, variables })
//     }
//     if(isLoggedIn()){
//         request.headers['authorization'] = 'Bearer ' + getAccessToken();
//     }
//     const response = await fetch(endpointURL, request);
//     const responseBody = await response.json();
//     if (responseBody.errors) {
//         const message = responseBody.errors.map((error) => error.message).join(`\n`);
//         // console.log(message)
//         throw new Error(message);
//     }
//     return responseBody.data;
// }

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

const createJobMutation = gql`
    mutation CreateJob($input: CreateJobInput) {
        job: createJob(input: $input) {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`;

const companyQuery = gql`
    query CompanyQuery($id: ID!){
        company(id:$id) {
            id
            name
            description
            jobs {
                id
                title
            }
        }
    }`;

const jobQuery = gql`
    query JobQuery($id: ID!) {
        job(id: $id) {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`;

const jobsQuery = gql`
    {
    jobs {
        id
        title
        company {
            id
            name
        }
    }
}`;



export async function createJob(input){
    // const { job } = await graphqlRequest(mutation, {input});
    const {data: {job}} = await client.mutate({
        mutation: createJobMutation,
        variables: {input},
        update: (cache, {data}) => {
            cache.writeQuery({
                query: jobQuery,
                variables: {id: data.job.id},
                data
            })
        }
    });
    return job;
}

export async function loadCompany(id){
    // const {company} = await graphqlRequest(query, {id});
    const { data: { company } } = await client.query({ query: companyQuery, variables: {id}});
    return company;
}

export async function loadJob(id){
    // const query = gql`query JobQuery($id: ID!) {
    //             job(id: $id) {
    //                 id
    //                 title
    //                 company {
    //                     id
    //                     name
    //                 }
    //                 description
    //             }
    //         }`;
    // const data = await graphqlRequest(query, {id})
    const {data: {job}} = await client.query({query: jobQuery, variables: {id}});
    return job;
}

export async function loadJobs() {
    const { data: { jobs } } = await client.query({ query: jobsQuery, fetchPolicy: 'no-cache'});
    // const {jobs} = await client.query({query});
    // const {jobs} = await graphqlRequest(query);
    return jobs;
}

// export async function loadJob(id){
//     const response = await fetch(endpointURL, {
//         method: 'POST',
//         headers: {'content-type': 'application/json'},
//         body: JSON.stringify({
//             query: `query JobQuery($id: ID!) {
//                 job(id: $id) {
//                     id
//                     title
//                     company {
//                         id
//                         name
//                     }
//                     description
//                 }
//             }`,
//             variables: {id}
//         })
//     });
//     const responseBody = await response.json();
//     return responseBody.data.job;
// }

// export async function loadJobs(){
//     const response = await fetch(endpointURL, {
//         method: 'POST',
//         headers: {'content-type': 'application/json'},
//         body: JSON.stringify({
//             query: `{
//                 jobs {
//                     id
//                     title
//                     company {
//                         id
//                         name
//                     }
//                 }
//             }`
//         })
//     });
//     const responseBody = await response.json();
//     return responseBody.data.jobs;
// }