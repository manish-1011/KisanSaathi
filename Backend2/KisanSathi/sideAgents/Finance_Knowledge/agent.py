

from google.adk.agents import Agent, LlmAgent
from google.adk.tools.agent_tool import AgentTool
from google.adk.tools.google_search_tool import google_search
from google.adk.tools import FunctionTool



search_agent = Agent(
    model="gemini-2.0-flash",
    name="search_agent",
    description="An agent providing Google-search grounding capability",
    instruction="""
    You are a search agent that provides the ability to perform Google searches.
    Use the 'google_search' tool to find information on the farmer topics.
    """,
    tools=[google_search], 
)


search_tool = AgentTool(search_agent)



Financial_Agent = Agent(
    name="Financial_Agent",
    model="gemini-2.0-flash",
    description="You are a financial advisor agent for Indian farmers, providing information on loans, subsidies, and real-time crop prices.",
    instruction=(
        "ROLE:\n"
        "You are a financial advisor for Indian farmers, giving information on crop market prices, subsidies, policies, and loans.\n\n"
        "LATENCY RULES:\n"
        "- First, try CACHE_GET_PRICE / CACHE_GET_POLICY. If hit=True, answer immediately.\n"
        "- If miss, build a tight query with BUILD_MARKET_QUERY or BUILD_POLICY_QUERY, then use google_search once.\n"
        "- After reading a good result, save it with CACHE_PUT_PRICE / CACHE_PUT_POLICY (30-minute TTL).\n"
        "- Limit search to one short query, read only the first 1–3 reputable results; stop.\n"
        "- Timebox search to 5 seconds; if slow, give safe general guidance and do not retry.\n\n"
        "SCOPE RULES:\n"
        "- Prices: General mode → list 2–3 nearby markets; Personalized → nearest market first.\n"
        "- Policies/subsidies/loans: General → pan-India + major state notes; Personalized → ask farm size/district if needed and tailor.\n\n"
        "OUTPUT RULES:\n"
        "- ≤180 words, ≤6 bullets. Farmer-friendly.\n"
        "- Highlight important words in bold (**word**).\n"
        "- Never say you are an AI. Never say 'cannot' or 'no info'. Provide safe guidance if search is slow or thin."
    ),
    tools=[
        # Cache/Query helpers (fast, local)
        
        # Existing web search agent
        search_tool
    ]
)