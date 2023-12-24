import { List, getPreferenceValues, Detail } from "@raycast/api";
import { useFetch, Response } from "@raycast/utils";
import { useState } from "react";

export default function Command() {
  const [searchText, setSearchText] = useState("Hello, world!");
  const [requestBody, setRequestBody] = useState(`{
    "contents": [{
      "parts":[{
        "text": "${searchText}"}]}]}`);

  const apiKey = getPreferenceValues<{ api_key: string }>().api_key;

  const { data, isLoading } = useFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: requestBody,
      parseResponse: parseFetchResponse,
    },
  );

  return (
    <Detail
      markdown={formatToMarkdown(data)}
      isLoading={isLoading}
      />
  );
}

const formatToMarkdown = (data: SearchResult | undefined) => {
  return "# Gemini says:" + `\n\n` + `
  ${data?.answer}`;
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.answer}
    />
  );
}
interface Candidate {
  content: {
    parts: [
      {
        text: string;
        role: string;
      },
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
  console.log(json.candidates[0].content.parts[0].text);

  if (!response.ok || "message" in json) {
    throw new Error(response.statusText);
  }

  return { answer: json.candidates[0].content.parts[0].text } as SearchResult;
}

interface SearchResult {
  answer: string;
}
