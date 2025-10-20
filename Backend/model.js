import dotenv from 'dotenv';
import {tavily} from "@tavily/core";
dotenv.config();


const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });


export async function main(prompt){
     const messages=[
          {
            role: "system",
            content: `You are a smart assistant that can access real-time data by calling a tool named webSearch. 
            Use webSearch only when you truly need to retrieve up-to-date information like date, time, or temperature. 
            Call it exactly once per query if needed. 

            When calling webSearch, always pass the parameters as a JSON object with a single key query. 
            For example: {"query": "current time"}.

            Do not call the tool multiple times unnecessarily. 
            If the answer can be given from your knowledge, respond directly without using webSearch`
          },
          {
            role: "user",
            content: prompt
          }
        ];
  try {
    while(true){
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.API_KEY,
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional
        "X-Title": "<YOUR_SITE_NAME>",     // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: messages,
        tools: [
          {
            type: "function",
            function: {
              name: "webSearch",
              description: "Search the web for relevant information and real time information like date,time or temperature etc.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query string to search on"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        // Fix: enable tool usage (model can decide to call a tool)
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Request failed: ${response.status} ${response.statusText} ${text}`);
    }

    const result = await response.json();

    const choice = result?.choices?.[0];
    const message = choice?.message ?? {};

    messages.push(result.choices[0].message);

    const toolCalls = message.tool_calls;
    if(!toolCalls){
        console.log("Final response from model:\n", message.content);
        return message.content;
    }
    for(const tools of toolCalls){
        const funName=tools.function.name;
        const parStr=tools.function.arguments;
        const par = JSON.parse(parStr);
        if(funName==="webSearch"){
            const res=await webSearch(par);
            messages.push({
                role: "tool",
                tool_call_id: tools.id,
                name: funName,
                content: res
            });   
        }
    } 
    }
    

    } catch (err) {
        console.error("Error calling API:", err);
        process.exitCode = 1;
    }
}



async function webSearch({query}){
    console.log("Performing web search for query");
    const response = await tvly.search(query);
    const finalResult=response.results.map(result=>result.content).join("\n");
    return finalResult;
}