import { ActionPanel, Action, List } from "@raycast/api";
import { useFetch, Response } from "@raycast/utils";
import { useState } from "react";
import { URLSearchParams } from "node:url";
import dotenv from 'dotenv';
import { text } from "stream/consumers";

// dotenv.config({ path: __dirname + '/.env' });

export default function Command() {
  const [searchText, setSearchText] = useState("");

  // const { data, isLoading } = useFetch(
  //   "https://api.npms.io/v2/search?" +
  //     new URLSearchParams({ q: searchText.length === 0 ? "@raycast/api" : searchText }),
  //   {
  //     parseResponse: parseFetchResponse,
  //   }
  // );
//   interface RequestInit {
//     /** A BodyInit object or null to set request's body. */
//     body?: BodyInit | null;
//     /** A string indicating how the request will interact with the browser's cache to set request's cache. */
//     cache?: RequestCache;
//     /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
//     credentials?: RequestCredentials;
//     /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
//     headers?: HeadersInit;
//     /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
//     integrity?: string;
//     /** A boolean to set request's keepalive. */
//     keepalive?: boolean;
//     /** A string to set request's method. */
//     method?: string;
//     /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
//     mode?: RequestMode;
//     /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
//     redirect?: RequestRedirect;
//     /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
//     referrer?: string;
//     /** A referrer policy to set request's referrerPolicy. */
//     referrerPolicy?: ReferrerPolicy;
//     /** An AbortSignal to set request's signal. */
//     signal?: AbortSignal | null;
//     /** Can only be null. Used to disassociate request from any Window. */
//     window?: null;
// }
  const [requestBody, setRequestBody] = useState(`{
    "contents": [{
      "parts":[{
        "text": "${searchText}"}]}]}`)

  const apiKey = ""; //process.env.API_KEY;
  console.log(apiKey)

  const { data, isLoading } = useFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: requestBody,
      parseResponse: parseFetchResponse,
    }
  );

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search npm packages..."
      throttle
    >
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((searchResult) => (
          <SearchListItem key={searchResult.name} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.answer}
      // actions={
      //   <ActionPanel>
      //     <ActionPanel.Section>
      //       <Action.OpenInBrowser title="Open in Browser" url={searchResult.url} />
      //     </ActionPanel.Section>
      //     <ActionPanel.Section>
      //       <Action.CopyToClipboard
      //         title="Copy Install Command"
      //         content={`npm install ${searchResult.name}`}
      //         shortcut={{ modifiers: ["cmd"], key: "." }}
      //       />
      //     </ActionPanel.Section>
      //   </ActionPanel>
      // }
    />
  );
}
interface Candidate {
  content: {
    parts: [
      {
        text: string;
        role: string;
      }
    ];
    role: string;
  };
  finishReason: string;
  index: number;
  safetyRatings: {
    category: string;
    probability: string;
  }[];
}

interface PromptFeedback {
  safetyRatings: {
    category: string;
    probability: string;
  }[];
}

interface APIResponse {
  candidates: Candidate[];
  promptFeedback: PromptFeedback;
}

/** Parse the response from the fetch query into something we can display */
async function parseFetchResponse(response: Response) {
  const json = (await response.json()) as APIResponse;

  if (!response.ok || "message" in json) {
    throw new Error(response.statusText);
  }

  return { answer: json.candidates[0].content.parts[0].text} as SearchResult;
}

interface SearchResult {
  answer: string;
}
