require("dotenv").config();
import PromisePool from "@supercharge/promise-pool";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import axios, { AxiosError } from "axios";
import { extractAddressFromPrivateKey, signMessage } from "./helper";

const GET_NONCE_QUERY = `query Query($address: String!) {
    nonce(address: $address)
  }`;

const LOGIN_QUERY = `mutation Login($address: String!, $signature: String!) {
    login(address: $address, signature: $signature) {
      accessToken
      user {
        _id
      }
    }
  }`;

const SEND_INVITATION_QUERY = `mutation SendInvitation($inviteeAddress: String!) {
    sendInvitation(inviteeAddress: $inviteeAddress) {
      loginUser {
        address
      }
      playAccount {
        address
      }
      roles
    }
  }`;

const { FILE_INPUT_PATH } = process.env;
const GRAPHQL_URL = "https://api.elpis.game/elpis-be/graphql"
const request = async (data: any, token?: string) => {
  const headers: any = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = token;
  }
  const res = await axios.post(GRAPHQL_URL, data, { timeout: 5000, headers });
  return res?.data?.data;
};

const login = async (privateKey: string) => {
  const address = extractAddressFromPrivateKey(privateKey);
  console.log(`Account '${address}' is logging into the 'Battle Elpis'`);
  const data = await request(
    JSON.stringify({
      operationName: "Query",
      query: GET_NONCE_QUERY,
      variables: { address },
    })
  );

  const { nonce } = data;
  const signature = signMessage(privateKey, nonce);
  return request(
    JSON.stringify({
      operationName: "Login",
      query: LOGIN_QUERY,
      variables: { address, signature },
    })
  );
};

const sendInvitation = async (ownerPrivateKey: string, scholar: string) => {
  const res = await login(ownerPrivateKey);
  const { accessToken } = res.login;
  console.log(
    `Account '${extractAddressFromPrivateKey(
      ownerPrivateKey
    )}' sends an invitation to account '${scholar}'`
  );
  return request(
    JSON.stringify({
      operationName: "SendInvitation",
      query: SEND_INVITATION_QUERY,
      variables: { inviteeAddress: scholar },
    }),
    `Bearer ${accessToken}`
  );
};

const sendInvitations = async () => {
  //Read data from csv file
  const fileData = await readFile(FILE_INPUT_PATH, {
    encoding: "utf8",
  });
  const records = parse(fileData, {
    columns: true,
    skip_empty_lines: true,
  });
  await PromisePool.withConcurrency(20)
    .for(records)
    .handleError((err: AxiosError) => {
      console.log(err.response?.data?.errors);
    })
    .process(async (record: { owner: string; scholar: string }) => {
      const res = await sendInvitation(record.owner, record.scholar);
      console.log(
        `Account '${extractAddressFromPrivateKey(record.owner)}' has successfully sent an invitation to account '${record.scholar}'`, res.sendInvitation
      );      
    });
};

(async function execute() {
  await sendInvitations();
})();
